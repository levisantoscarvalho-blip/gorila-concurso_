# Baixa, cidade por cidade, a página de concursos do PCI Concursos (pciconcursos.com.br/concursos/<uf>/<cidade>)
# e guarda os concursos dos últimos 12 meses em pci-cidades/<UF>.tsv (uma linha por concurso).
# O robots.txt do PCI permite /concursos/. Uma página por vez, com pausa, para não sobrecarregar o site.
# Retoma de onde parou: cidades que já estão no .tsv são puladas.
# Uso:  .\baixar-pci-cidades.ps1 -Ufs SP,MG    (sem -Ufs = todos os estados)
param([string[]]$Ufs = @('AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'),
      [string]$Desde = '2025-10-15', [int]$PausaMs = 400)
$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'
$dir = Join-Path $PSScriptRoot 'pci-cidades'; New-Item -ItemType Directory -Force $dir | Out-Null
$utf8 = New-Object Text.UTF8Encoding $false
$hdr = @{ 'User-Agent' = 'Mozilla/5.0 (GorilaConcurso; levantamento de concursos por cidade)' }
function Baixar([string]$url){
  for($t=1; $t -le 3; $t++){
    try { return (Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 40 -Headers $hdr).Content }
    catch { if($t -eq 3){ return $null }; Start-Sleep -Seconds (5*$t) }
  }
}
function Limpa([string]$s){ return ([Net.WebUtility]::HtmlDecode(($s -replace '<[^>]+>',' ')) -replace '\s+',' ').Trim() }
# "19/10 a 03/12/2026" · "15/10/2026" · "Prorrogado até 23/11/2026" ➔ (início, fim) em AAAA-MM-DD
function Datas([string]$s){
  $fim = [regex]::Matches($s, '(\d{2})/(\d{2})/(\d{4})') | Select-Object -Last 1
  if(-not $fim){ return $null }
  $ate = "$($fim.Groups[3].Value)-$($fim.Groups[2].Value)-$($fim.Groups[1].Value)"; $de = ''
  if($s -match '^\s*(\d{2})/(\d{2})(?:/(\d{4}))?\s+a\s+'){ $ano = if($Matches[3]){ $Matches[3] } else { $fim.Groups[3].Value }; $de = "$ano-$($Matches[2])-$($Matches[1])" }
  return @($de, $ate)
}
$rxItem = [regex]'<div class="(na|ea)" onclick="myClick\(event\)" data-url="https://www\.pciconcursos\.com\.br/noticias/([^"]+)"[\s\S]*?<div class="ca"><a [^>]*>([\s\S]*?)</a>[\s\S]*?<div class="cd">([\s\S]*?)</div>\s*<div class="ce">([\s\S]*?)</div>'
foreach($uf in $Ufs){
  $arq = Join-Path $dir "$uf.tsv"; $feitas = @{}
  if(Test-Path $arq){ foreach($l in [IO.File]::ReadAllLines($arq, $utf8)){ $feitas[$l.Split("`t")[0]] = 1 } }
  $u = $uf.ToLower()
  $idx = Baixar "https://www.pciconcursos.com.br/concursos/$u/"
  if(-not $idx){ "$uf ERRO ao baixar a lista de cidades"; continue }
  $cidades = [regex]::Matches($idx, '<a href="https://www\.pciconcursos\.com\.br/concursos/' + $u + '/([a-z0-9\-]+)"[^>]*>([^<]+)</a>') | ForEach-Object { @{ slug=$_.Groups[1].Value; nome=[Net.WebUtility]::HtmlDecode($_.Groups[2].Value).Trim() } }
  $cidades = $cidades | Group-Object { $_.slug } | ForEach-Object { $_.Group[0] }
  "$uf`: $($cidades.Count) cidades ($($feitas.Count) já feitas)"
  $n = 0
  foreach($c in $cidades){
    if($feitas.ContainsKey($c.slug)){ continue }
    $html = Baixar "https://www.pciconcursos.com.br/concursos/$u/$($c.slug)"
    Start-Sleep -Milliseconds $PausaMs
    $linhas = New-Object Collections.ArrayList
    if($html){
      foreach($m in $rxItem.Matches($html)){
        $d = Datas (Limpa $m.Groups[5].Value); if(-not $d -or $d[1] -lt $Desde){ continue }
        $partes = $m.Groups[4].Value -split '<br\s*/?>'
        $vagasTxt = Limpa $partes[0]; $cargo = if($partes.Count -gt 1){ Limpa $partes[1] } else { '' }; $nivel = if($partes.Count -gt 2){ Limpa $partes[2] } else { '' }
        $v = 0; if($vagasTxt -match '^([\d\.]+)\s+vaga'){ $v = [int]($Matches[1] -replace '\.','') }
        $cr = if($vagasTxt -match 'reserva'){ 'CR' } else { '' }
        [void]$linhas.Add(($c.slug, $c.nome, (Limpa $m.Groups[3].Value), $cargo, $nivel, $v, $cr, $d[0], $d[1], $m.Groups[2].Value, $m.Groups[1].Value) -join "`t")
      }
      if(-not $linhas.Count){ [void]$linhas.Add(($c.slug, $c.nome, '', '', '', 0, '', '', '', '', 'vazio') -join "`t") }   # marca a cidade como feita
    } else { "  $uf/$($c.slug): ERRO (será tentada de novo na próxima vez)"; continue }
    [IO.File]::AppendAllText($arq, (($linhas -join "`n") + "`n"), $utf8)
    $n++; if($n % 50 -eq 0){ "  $uf`: $n cidades nesta rodada" }
  }
  "$uf pronto ($n cidades nesta rodada)"
}
