# Junta pci-noticias/*.jsonl (baixar-pci-noticias.ps1) em site/noticias/concursos-detalhes/<UF>.js:
#   CONC_DETALHES['UF'] = { 'link-da-noticia': {p:publicado, ti:título, o:site do órgão, b:site da banca, cg:[cargos], smin, smax,
#                           tmin, tmax (taxa), pr:prova, v:validade em anos, t:'concurso'|'seletivo', e:[nomes dos editais]} }
# Cada estado recebe só as notícias que aparecem nele (páginas das cidades + lista regional de abertos).
param([string]$Site = (Join-Path $PSScriptRoot '..\site'))
$ErrorActionPreference = 'Stop'
$utf8 = New-Object Text.UTF8Encoding $false
$saida = Join-Path $Site 'noticias\concursos-detalhes'; New-Item -ItemType Directory -Force $saida | Out-Null
$det = @{}
foreach($f in Get-ChildItem (Join-Path $PSScriptRoot 'pci-noticias') -Filter *.jsonl){
  foreach($l in [IO.File]::ReadAllLines($f.FullName, $utf8)){ if(-not $l.Trim()){ continue }
    $o = $l | ConvertFrom-Json; if($o.erro){ continue }
    $r = [ordered]@{}
    if($o.pub){ $r.p=$o.pub }; if($o.tit){ $r.ti=$o.tit }; if($o.orgao_site){ $r.o=$o.orgao_site }; if($o.banca_site){ $r.b=$o.banca_site }
    # travas: salário acima de R$ 100 mil ou taxa acima de R$ 1.000 = leitura errada da notícia ➔ não mostra (AVISO no relatório)
    $salOk = -not $o.sal_max -or [double]$o.sal_max -le 100000; $taxaOk = -not $o.taxa_max -or [double]$o.taxa_max -le 1000
    if(-not $salOk){ "AVISO salário impossível (R$ $($o.sal_max)), não mostrado: $($o.s)" }
    if(-not $taxaOk){ "AVISO taxa impossível (R$ $($o.taxa_max)), não mostrada: $($o.s)" }
    if($o.cargos){ $r.cg=@($o.cargos) }; if($salOk -and $o.sal_min){ $r.smin=$o.sal_min }; if($salOk -and $o.sal_max){ $r.smax=$o.sal_max }
    if($taxaOk -and $o.taxa_min){ $r.tmin=$o.taxa_min }; if($taxaOk -and $o.taxa_max){ $r.tmax=$o.taxa_max }; if($o.prova){ $r.pr=$o.prova }; if($o.validade){ $r.v=$o.validade }
    if($o.tipo){ $r.t=$o.tipo }; if($o.editais){ $r.e=@($o.editais) }
    $det[$o.s] = ($r | ConvertTo-Json -Compress -Depth 3)
  }
}
"notícias com detalhes: $($det.Count)"
$porUf = @{}
foreach($f in Get-ChildItem (Join-Path $PSScriptRoot 'pci-cidades') -Filter *.tsv){ $uf=$f.BaseName; $porUf[$uf]=New-Object Collections.Generic.HashSet[string]
  foreach($l in [IO.File]::ReadAllLines($f.FullName,$utf8)){ $p=$l.Split("`t"); if($p.Count -ge 11 -and $p[9]){ [void]$porUf[$uf].Add($p[9]) } } }
foreach($l in [IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'abertos.txt'),$utf8)){ $p=$l.Split('|'); if($p.Count -ge 7 -and $p[6] -and $porUf[$p[0]]){ [void]$porUf[$p[0]].Add($p[6]) } }
foreach($uf in ($porUf.Keys | Sort-Object)){
  $sb = New-Object Text.StringBuilder; $n=0
  [void]$sb.AppendLine("/* Detalhes das notícias de concursos — $uf (fatos extraídos das notícias do PCI Concursos; não é o texto delas). Gerado por gerar-detalhes.ps1. Não editar à mão. */")
  [void]$sb.AppendLine("CONC_DETALHES['$uf'] = {")
  # link estranho (aspas etc.) não entra: quebraria o arquivo
  foreach($s in $porUf[$uf]){ if($det.ContainsKey($s) -and $s -match '^[a-z0-9\-]+$'){ [void]$sb.AppendLine("'$s':$($det[$s]),"); $n++ } }
  [void]$sb.AppendLine('};')
  [IO.File]::WriteAllText((Join-Path $saida "$uf.js"), $sb.ToString(), $utf8)
  "$uf`: $n de $($porUf[$uf].Count)"
}
