param([string]$Site, [string]$Dir)
$ErrorActionPreference = 'Stop'
$utf8 = New-Object Text.UTF8Encoding $false
$PCI = 'https://www.pciconcursos.com.br/noticias/'
$REG = @{ AC='norte';AM='norte';AP='norte';PA='norte';RO='norte';RR='norte';TO='norte';
  AL='nordeste';BA='nordeste';CE='nordeste';MA='nordeste';PB='nordeste';PE='nordeste';PI='nordeste';RN='nordeste';SE='nordeste';
  ES='sudeste';MG='sudeste';RJ='sudeste';SP='sudeste';PR='sul';RS='sul';SC='sul';DF='centrooeste';GO='centrooeste';MS='centrooeste';MT='centrooeste' }

function Norm([string]$s){
  $d = $s.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
  $sb = New-Object Text.StringBuilder
  foreach($ch in $d.ToCharArray()){ if([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne 'NonSpacingMark'){ [void]$sb.Append($ch) } }
  return ($sb.ToString() -replace "[^a-z0-9]", '')
}
function Js([string]$s){ return '"' + ($s -replace '\\','\\' -replace '"','\"') + '"' }
function Iso([string]$d){ $p=$d.Split('/'); return "$($p[2])-$($p[1])-$($p[0])" }

# códigos IBGE de cada cidade, por estado
$codigos = @{}
function Codigo($uf, $cidade){
  if(-not $codigos.ContainsKey($uf)){
    $m = @{}; $txt = [IO.File]::ReadAllText("$Site\noticias\municipios\$uf.js", $utf8)
    foreach($x in [regex]::Matches($txt, "c:'(\d{7})',n:'((?:[^'\\]|\\.)*)'")){ $m[(Norm ($x.Groups[2].Value -replace "\\'", "'"))] = $x.Groups[1].Value }
    $codigos[$uf] = $m
  }
  return $codigos[$uf][(Norm $cidade)]
}

$dados = @{}
function Uf($uf){ if(-not $dados.ContainsKey($uf)){ $dados[$uf] = @{ est = New-Object Collections.ArrayList; mun = [ordered]@{} } }; return $dados[$uf] }
$naoAchou = @()

foreach($l in [IO.File]::ReadAllLines("$Dir\abertos.txt", $utf8)){
  if(-not $l.Trim()){ continue }
  $f = $l.Split('|'); $uf=$f[0]; $org=$f[1]; $cid=$f[2]; $vag=$f[3]; $cargo=$f[4]; $datas=$f[5]; $slug=$f[6]
  $v = 0; if($vag -match '^\d+'){ $v = [int]$Matches[0] }
  $de = ''; $ate = $datas
  if($datas.Contains('>')){ $de,$ate = $datas.Split('>') }
  $quando = if($de){ "de $de a $ate" } else { "até $ate" }
  if($vag -eq 'CR'){ $quando += ' · cadastro de reserva' }
  $item = "{orgao:$(Js $org),cargo:$(Js $cargo),status:""aberto"",vagas:$v,ate:""$(Iso $ate)"""
  if($de){ $item += ",de:""$(Iso $de)""" }
  $item += ",quando:$(Js $quando),fonte:{nome:""PCI Concursos"",url:$(Js ($PCI+$slug))}}"
  $u = Uf $uf
  if($cid -eq '-'){ [void]$u.est.Add($item); continue }
  $cod = Codigo $uf $cid
  if(-not $cod){ $naoAchou += "$uf $cid"; continue }
  if(-not $u.mun.Contains($cod)){ $u.mun[$cod] = New-Object Collections.ArrayList }
  [void]$u.mun[$cod].Add($item)
}

foreach($l in [IO.File]::ReadAllLines("$Dir\previstos.txt", $utf8)){
  if(-not $l.Trim() -or $l.StartsWith('#')){ continue }
  $f = $l.Split('|'); $uf=$f[0]; $st=$f[1]; $org=$f[2]; $cargo=$f[3]; $v=[int]$f[4]; $q=$f[5]; $banca=$f[6]; $dt=$f[7]; $fn=$f[8]; $fu=$f[9]
  $item = "{orgao:$(Js $org),cargo:$(Js $cargo),status:""$st"",vagas:$v"
  if($banca){ $item += ",banca:$(Js $banca)" }
  $item += ",quando:$(Js "$q (notícia de $dt)"),fonte:{nome:$(Js $fn),url:$(Js $fu)}}"
  [void](Uf $uf).est.Add($item)
}

# previstos de prefeituras/câmaras/guardas: entram na cidade (ponto azul no mapa)
if(Test-Path "$Dir\municipais-previstos.txt"){
  foreach($l in [IO.File]::ReadAllLines("$Dir\municipais-previstos.txt", $utf8)){
    if(-not $l.Trim() -or $l.StartsWith('#')){ continue }
    $f = $l.Split('|'); $uf=$f[0]; $org=$f[1]; $cid=$f[2]; $cargo=$f[3]; $v=[int]$f[4]; $q=$f[5]; $banca=$f[6]; $dt=$f[7]; $fu=$f[8]
    $fn = if($fu -match 'oliberal'){ 'O Liberal' } elseif($fu -match 'grancursos'){ 'Gran Cursos' } else { 'Estratégia Concursos' }
    $st = if($f.Count -gt 9 -and $f[9]){ $f[9] } else { 'previsto' }
    $item = "{orgao:$(Js $org),cargo:$(Js $cargo),status:""$st"",vagas:$v"
    if($banca){ $item += ",banca:$(Js $banca)" }
    $item += ",quando:$(Js "$q (notícia de $dt)"),fonte:{nome:$(Js $fn),url:$(Js $fu)}}"
    $cod = Codigo $uf $cid
    if(-not $cod){ $naoAchou += "$uf $cid"; continue }
    $u = Uf $uf
    if(-not $u.mun.Contains($cod)){ $u.mun[$cod] = New-Object Collections.ArrayList }
    [void]$u.mun[$cod].Add($item)
  }
}

$sb = New-Object Text.StringBuilder
[void]$sb.AppendLine('/* ════════════════════════════════════════════')
[void]$sb.AppendLine('   LEVANTAMENTO DE CONCURSOS DE TODOS OS ESTADOS (feito em 15/10/2026; pedido do Levi: só dado real, com fonte)')
[void]$sb.AppendLine('   • Inscrições abertas: PCI Concursos (páginas por região, 15/10/2026). Quando a data "ate" passa, o site mostra')
[void]$sb.AppendLine('     "inscrições encerradas" sozinho (cmConcursoHoje em concursos-mapa.js).')
[void]$sb.AppendLine('   • Previstos: Estratégia Concursos (páginas por estado, ago–out/2026), O Liberal (PA) e JC Concursos (PC-TO).')
[void]$sb.AppendLine('   Arquivo GERADO a partir de duas tabelas; SP também tem o levantamento manual em concursos-dados.js.')
[void]$sb.AppendLine('   ════════════════════════════════════════════ */')
[void]$sb.AppendLine('const CONCURSOS_LEVANTAMENTO = {')
foreach($uf in ($dados.Keys | Sort-Object)){
  $u = $dados[$uf]
  [void]$sb.AppendLine("  $uf`: { atualizado:""15/10/2026"", todos:""https://www.pciconcursos.com.br/concursos/$($REG[$uf])/"",")
  [void]$sb.AppendLine('    estaduais: [')
  foreach($i in $u.est){ [void]$sb.AppendLine("      $i,") }
  [void]$sb.AppendLine('    ],')
  [void]$sb.AppendLine('    municipais: {')
  foreach($c in $u.mun.Keys){ [void]$sb.AppendLine("      '$c': [ " + ($u.mun[$c] -join ', ') + ' ],') }
  [void]$sb.AppendLine('    },')
  [void]$sb.AppendLine('  },')
}
[void]$sb.AppendLine('};')
[IO.File]::WriteAllText("$Site\noticias\concursos-levantamento.js", $sb.ToString(), $utf8)
"Estados: $($dados.Count)"
foreach($uf in ($dados.Keys | Sort-Object)){ "$uf est=$($dados[$uf].est.Count) cidades=$($dados[$uf].mun.Count)" }
"NAO ACHOU: " + ($naoAchou -join '; ')
