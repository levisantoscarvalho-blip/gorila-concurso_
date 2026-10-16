# CONFERÊNCIA ANTES DE PUBLICAR (robô diário). Compara os arquivos que acabaram de ser gerados com os que estão NO AR
# (última versão no git). Se algo parecer quebrado, sai com erro (exit 1) e o robô NÃO publica — o site fica com os
# dados de ontem e o GitHub manda um e-mail avisando. Regras:
#   • os 27 arquivos de cidades e de detalhes existem e terminam direito;
#   • o total de concursos não cai mais de 15% de uma vez, e nenhum estado grande (30+) perde mais de 40%;
#   • os detalhes não caem mais de 15%; o levantamento estadual não cai mais de 20%;
#   • se o Node estiver instalado (no robô está), cada arquivo passa pela checagem de sintaxe do JavaScript.
param([string]$Site = (Join-Path $PSScriptRoot '..\site'))
. (Join-Path $PSScriptRoot 'comum.ps1')
$ErrorActionPreference = 'Continue'
$falhas = New-Object Collections.ArrayList; $raiz = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
function Conta([string]$txt, [string]$rx){ return [regex]::Matches($txt, $rx).Count }
function NoAr([string]$rel){   # conteúdo do arquivo na última versão publicada (git HEAD); '' se não existir
  $r = git -C $raiz show "HEAD:$rel" 2>$null; if($LASTEXITCODE -ne 0){ return $null }; return ($r -join "`n") }
$temGit = [bool](Get-Command git -ErrorAction SilentlyContinue); $temNode = [bool](Get-Command node -ErrorAction SilentlyContinue)
if(-not $temGit){ "(sem git: não dá para comparar com a versão no ar)" }
$totN = 0; $totV = 0; $detN = 0; $detV = 0
foreach($uf in $TODAS_UFS){
  foreach($tipo in 'concursos-cidades','concursos-detalhes'){
    $arq = Join-Path $Site "noticias\$tipo\$uf.js"
    if(-not (Test-Path $arq)){ [void]$falhas.Add("$tipo/$uf.js não existe"); continue }
    $txt = [IO.File]::ReadAllText($arq, $utf8)
    if($txt.TrimEnd() -notmatch '\};$'){ [void]$falhas.Add("$tipo/$uf.js termina errado (arquivo cortado?)") }
    $velho = if($temGit){ NoAr "Html_Gorilaconcurso/site/noticias/$tipo/$uf.js" } else { $null }
    if($tipo -eq 'concursos-cidades'){
      $n = Conta $txt '\["'; $totN += $n
      if($velho){ $v = Conta $velho '\["'; $totV += $v; if($v -ge 30 -and $n -lt 0.6*$v){ [void]$falhas.Add("$uf`: concursos caíram de $v para $n") } }
    } else {
      $n = Conta $txt "(?m)^'"; $detN += $n; if($velho){ $detV += Conta $velho "(?m)^'" }
    }
  }
}
"concursos nas cidades: $totN (no ar: $totV) · detalhes: $detN (no ar: $detV)"
if($totV -and $totN -lt 0.85*$totV){ [void]$falhas.Add("total de concursos caiu de $totV para $totN") }
if($detV -and $detN -lt 0.85*$detV){ [void]$falhas.Add("detalhes caíram de $detV para $detN") }
$lev = Join-Path $Site 'noticias\concursos-levantamento.js'; $txt = [IO.File]::ReadAllText($lev, $utf8); $n = Conta $txt 'orgao:'
$velho = if($temGit){ NoAr 'Html_Gorilaconcurso/site/noticias/concursos-levantamento.js' } else { $null }
$v = if($velho){ Conta $velho 'orgao:' } else { 0 }
"levantamento estadual/municipal: $n (no ar: $v)"
if($txt.TrimEnd() -notmatch '\};$'){ [void]$falhas.Add('concursos-levantamento.js termina errado') }
if($v -and $n -lt 0.8*$v){ [void]$falhas.Add("levantamento caiu de $v para $n") }
if($temNode){
  $arqs = @($lev) + @(Get-ChildItem (Join-Path $Site 'noticias\concursos-cidades') -Filter *.js | ForEach-Object FullName) + @(Get-ChildItem (Join-Path $Site 'noticias\concursos-detalhes') -Filter *.js | ForEach-Object FullName)
  foreach($a in $arqs){ $saida = node --check $a 2>&1; if($LASTEXITCODE -ne 0){ [void]$falhas.Add("erro de JavaScript em $(Split-Path $a -Leaf): $saida") } }
  "sintaxe conferida com o Node em $($arqs.Count) arquivos"
} else { "(sem Node: sintaxe não conferida aqui)" }
if($falhas.Count){ "NÃO PUBLICAR:"; $falhas | ForEach-Object { "  - $_" }; exit 1 }
"OK: pode publicar"
exit 0
