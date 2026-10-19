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
# fim das inscrições de cada notícia (a mais nova, se aparece em mais de uma cidade): separa RECENTES de ANTIGOS
$ate = @{}
function Guarda([string]$s, [string]$d){ if($d -gt [string]$ate[$s]){ $ate[$s] = $d } }
foreach($f in Get-ChildItem (Join-Path $PSScriptRoot 'pci-cidades') -Filter *.tsv){ $uf=$f.BaseName; $porUf[$uf]=New-Object Collections.Generic.HashSet[string]
  foreach($l in [IO.File]::ReadAllLines($f.FullName,$utf8)){ $p=$l.Split("`t"); if($p.Count -ge 11 -and $p[9]){ [void]$porUf[$uf].Add($p[9]); Guarda $p[9] $(if($p[10] -eq 'suspenso'){ '9999' } else { $p[8] }) } } }   # suspenso = atual
foreach($l in [IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'abertos.txt'),$utf8)){ $p=$l.Split('|'); if($p.Count -ge 7 -and $p[6] -and $porUf[$p[0]]){ [void]$porUf[$p[0]].Add($p[6])
  $d = [regex]::Matches($p[5], '(\d{2})/(\d{2})/(\d{4})') | Select-Object -Last 1; Guarda $p[6] $(if($d){ "$($d.Groups[3].Value)-$($d.Groups[2].Value)-$($d.Groups[1].Value)" } else { '9999' }) } }
# RECENTES (fim das inscrições nos últimos 12 meses, ou sem data) ➔ UF.js, carregado ao abrir o estado.
# ANTIGOS ➔ UF-antigos.js, carregado só quando a pessoa abre a lista dos que já aconteceram ou um concurso antigo
# (desde 18/10/2026 o mapa guarda vários anos; tudo num arquivo só deixaria o estado lento para abrir).
$corte = (Get-Date).AddYears(-1).ToString('yyyy-MM-dd')
foreach($uf in ($porUf.Keys | Sort-Object)){
  $rec = New-Object Text.StringBuilder; $ant = New-Object Text.StringBuilder; $n=0; $na=0
  [void]$rec.AppendLine("/* Detalhes das notícias de concursos — $uf, últimos 12 meses (fatos extraídos das notícias do PCI Concursos; não é o texto delas). Gerado por gerar-detalhes.ps1. Não editar à mão. */")
  [void]$rec.AppendLine("CONC_DETALHES['$uf'] = {")
  [void]$ant.AppendLine("/* Detalhes das notícias de concursos ANTIGOS — $uf (inscrições encerradas há mais de 12 meses). Junta-se a CONC_DETALHES['$uf']. Gerado por gerar-detalhes.ps1. Não editar à mão. */")
  [void]$ant.AppendLine("Object.assign(CONC_DETALHES['$uf'] = CONC_DETALHES['$uf'] || {}, {")
  # link estranho (aspas etc.) não entra: quebraria o arquivo
  foreach($s in $porUf[$uf]){ if($det.ContainsKey($s) -and $s -match '^[a-z0-9\-]+$'){
    if([string]$ate[$s] -ge $corte){ [void]$rec.AppendLine("'$s':$($det[$s]),"); $n++ } else { [void]$ant.AppendLine("'$s':$($det[$s]),"); $na++ } } }
  [void]$rec.AppendLine('};'); [void]$ant.AppendLine('});')
  [IO.File]::WriteAllText((Join-Path $saida "$uf.js"), $rec.ToString(), $utf8)
  [IO.File]::WriteAllText((Join-Path $saida "$uf-antigos.js"), $ant.ToString(), $utf8)
  "$uf`: $n recentes + $na antigos de $($porUf[$uf].Count)"
}
