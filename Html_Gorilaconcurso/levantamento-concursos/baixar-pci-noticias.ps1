# Lê a NOTÍCIA de cada concurso no PCI Concursos (pciconcursos.com.br/noticias/<link>) e guarda os FATOS do edital
# (não o texto do PCI): data de publicação, site do órgão, site/página da banca, cargos com vagas, maior remuneração,
# taxa(s), data da prova, validade, nomes dos editais. Uma linha JSON por notícia em pci-noticias/parte-N.jsonl.
# Os PDFs do PCI ficam atrás de verificação ("não sou robô") e o robots.txt proíbe /pdf/ — NÃO são baixados.
# Uso: .\baixar-pci-noticias.ps1 -Parte 0 -Partes 4   (roda as 4 partes em paralelo, cada uma com uma fatia dos links)
# -Max N: baixa no máximo N nesta rodada, AS MAIS RECENTES PRIMEIRO (desde 18/10/2026 o mapa guarda concursos de vários anos;
# as notícias antigas que faltam vão sendo baixadas aos poucos, um pouco por dia, sem estourar o tempo do robô).
param([int]$Parte = 0, [int]$Partes = 1, [int]$PausaMs = 350, [int]$Max = 0)
$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'
$utf8 = New-Object Text.UTF8Encoding $false
$dir = Join-Path $PSScriptRoot 'pci-noticias'; New-Item -ItemType Directory -Force $dir | Out-Null
$arq = Join-Path $dir "parte-$Parte.jsonl"
# arquivo passou de 40 MB ➔ continua num novo (parte-10, parte-20...): o GitHub reclama de arquivos grandes e recusa acima de 100 MB
for($k = $Parte; (Test-Path $arq) -and (Get-Item $arq).Length -gt 40MB; ){ $k += 10; $arq = Join-Path $dir "parte-$k.jsonl" }
$hdr = @{ 'User-Agent' = 'Mozilla/5.0 (GorilaConcurso; levantamento de concursos)' }
# todos os links de notícia que o mapa usa (páginas das cidades + lista regional de abertos)
$slugs = @{}   # link ➔ data do fim das inscrições (para baixar as mais recentes primeiro)
foreach($f in Get-ChildItem (Join-Path $PSScriptRoot 'pci-cidades') -Filter *.tsv){ foreach($l in [IO.File]::ReadAllLines($f.FullName,$utf8)){ $p=$l.Split("`t"); if($p.Count -ge 11 -and $p[9] -and $p[8] -gt [string]$slugs[$p[9]]){ $slugs[$p[9]] = $p[8] } } }
foreach($l in [IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'abertos.txt'),$utf8)){ $p=$l.Split('|'); if($p.Count -ge 7 -and $p[6] -and -not $slugs.ContainsKey($p[6])){ $slugs[$p[6]] = '9999' } }
$lista = @($slugs.Keys | Sort-Object { $slugs[$_] } -Descending) | Where-Object { ([Math]::Abs($_.GetHashCode()) % $Partes) -eq $Parte }
# já baixadas: em QUALQUER parte (o robô diário roda com uma parte só e não pode baixar tudo de novo)
$feitos = @{}; foreach($fj in Get-ChildItem $dir -Filter 'parte-*.jsonl'){ foreach($l in [IO.File]::ReadAllLines($fj.FullName,$utf8)){ if($l -match '"s":"([^"]+)"'){ $feitos[$Matches[1]]=1 } } }
"parte $Parte`: $($lista.Count) notícias ($($feitos.Count) já feitas)"
function Limpa([string]$s){ return ([Net.WebUtility]::HtmlDecode(($s -replace '<[^>]+>',' ')) -replace '\s+',' ').Trim() }
$MES = @{janeiro='01';fevereiro='02';'março'='03';marco='03';abril='04';maio='05';junho='06';julho='07';agosto='08';setembro='09';outubro='10';novembro='11';dezembro='12'}
function DataPt([string]$s){   # "20 de dezembro de 2026" ➔ 2026-12-20 · "20/12/2026" ➔ 2026-12-20
  if($s -match '(\d{1,2})\s+de\s+([a-zç]+)\s+de\s+(\d{4})' -and $MES[$Matches[2]]){ return '{0}-{1}-{2:00}' -f $Matches[3],$MES[$Matches[2]],[int]$Matches[1] }
  if($s -match '(\d{2})/(\d{2})/(\d{4})'){ return "$($Matches[3])-$($Matches[2])-$($Matches[1])" }
  return '' }
function Num([string]$s){ return [double](($s -replace '\.','') -replace ',','.') }
$n = 0
foreach($s in $lista){
  if($feitos.ContainsKey($s)){ continue }
  if($Max -and $n -ge $Max){ break }
  $html = $null
  for($t=1; $t -le 3 -and -not $html; $t++){ try { $html = (Invoke-WebRequest -UseBasicParsing "https://www.pciconcursos.com.br/noticias/$s" -TimeoutSec 40 -Headers $hdr).Content } catch { if($_.Exception.Response.StatusCode.value__ -eq 404){ break }; Start-Sleep -Seconds (4*$t) } }
  Start-Sleep -Milliseconds $PausaMs
  $o = [ordered]@{ s=$s }
  if(-not $html){ $o.erro=1 } else {
    $corpo = [regex]::Match($html, '<div itemprop="articleBody">([\s\S]*?)</div></article>').Groups[1].Value
    $o.pub = [regex]::Match($html, '<abbr class="published" title="(\d{4}-\d{2}-\d{2})').Groups[1].Value
    $o.tit = Limpa ([regex]::Match($html, '<h1 itemprop="headline">([\s\S]*?)</h1>').Groups[1].Value)
    $ext = [regex]::Matches($corpo, '<a href="(https?://[^"]+)"[^>]*>([\s\S]*?)</a>') | Where-Object { $_.Groups[1].Value -notmatch 'pciconcursos\.com\.br' }
    if($ext){ $o.orgao_site = $ext[0].Groups[1].Value }
    $pars = [regex]::Matches($corpo, '<p>([\s\S]*?)</p>') | ForEach-Object { $_.Groups[1].Value }
    $pInsc = $pars | Where-Object { $_ -match '(?i)inscri' } | Select-Object -First 1
    if($pInsc){ $lk = [regex]::Matches($pInsc, '<a href="(https?://[^"]+)"') | Where-Object { $_.Groups[1].Value -notmatch 'pciconcursos' } | Select-Object -Last 1; if($lk){ $o.banca_site = $lk.Groups[1].Value } }
    $txt = Limpa $corpo
    $o.cargos = @([regex]::Matches($corpo, '<li>([\s\S]*?)</li>') | ForEach-Object { Limpa $_.Groups[1].Value } | Where-Object { $_ } | Select-Object -First 25)
    $rs = [regex]::Matches($txt, 'R\$\s*([\d\.]+,\d{2})') | ForEach-Object { Num $_.Groups[1].Value }
    $taxas = [regex]::Matches($txt, '(?i)taxas?\s+de\s+inscri[çc][ãa]o[^.]*?R\$\s*([\d\.]+,\d{2})(?:[^.]*?R\$\s*([\d\.]+,\d{2}))?')
    $tx = @(); foreach($m in $taxas){ $tx += Num $m.Groups[1].Value; if($m.Groups[2].Success){ $tx += Num $m.Groups[2].Value } }
    if($tx.Count){ $o.taxa_min = ($tx | Measure-Object -Minimum).Minimum; $o.taxa_max = ($tx | Measure-Object -Maximum).Maximum }
    $sal = $rs | Where-Object { $tx -notcontains $_ -and $_ -ge 500 }
    if($sal){ $o.sal_max = ($sal | Measure-Object -Maximum).Maximum; $o.sal_min = ($sal | Measure-Object -Minimum).Minimum }
    $pProva = [regex]::Match($txt, '(?i)prova[^.]{0,120}?(\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{4}|\d{2}/\d{2}/\d{4})')
    if($pProva.Success){ $o.prova = DataPt $pProva.Groups[1].Value }
    if($txt -match '(?i)validade[^.]{0,60}?(um|dois|1|2)\s+anos?'){ $o.validade = @{um=1;dois=2;'1'=1;'2'=2}[$Matches[1].ToLower()] }
    if($txt -match '(?i)processo seletivo|sele[çc][ãa]o simplificad|contrata[çc][ãa]o tempor'){ $o.tipo = 'seletivo' } else { $o.tipo = 'concurso' }
    $o.editais = @([regex]::Matches($html, '<li class="pdf"><a [^>]*title="([^"]+)"') | ForEach-Object { [Net.WebUtility]::HtmlDecode($_.Groups[1].Value) } | Select-Object -First 8)
  }
  [IO.File]::AppendAllText($arq, (($o | ConvertTo-Json -Compress -Depth 4) + "`n"), $utf8)
  $n++; if($n % 200 -eq 0){ "  parte $Parte`: $n notícias nesta rodada" }
}
$faltam = @($lista | Where-Object { -not $feitos.ContainsKey($_) }).Count - $n
"parte $Parte pronta ($n nesta rodada$(if($faltam -gt 0){", faltam $faltam para as próximas"}))"
