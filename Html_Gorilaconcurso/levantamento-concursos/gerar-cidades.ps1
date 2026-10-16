# Transforma pci-cidades/<UF>.tsv (baixado por baixar-pci-cidades.ps1) em site/noticias/concursos-cidades/<UF>.js:
#   CONC_CIDADES['UF'] = { atualizado:'DD/MM/AAAA', c:{ 'código IBGE': [ [órgão, cargo, nível, vagas, CR, início, fim, link], ... ] } }
# O site carrega o arquivo do estado só quando o estado é aberto. A situação (aberto/encerrado) é calculada pela data.
param([string]$Site = (Join-Path $PSScriptRoot '..\site'), [string]$Data = (Get-Date -Format 'dd/MM/yyyy'))
$ErrorActionPreference = 'Stop'
$utf8 = New-Object Text.UTF8Encoding $false
$dir = Join-Path $PSScriptRoot 'pci-cidades'; $saida = Join-Path $Site 'noticias\concursos-cidades'
New-Item -ItemType Directory -Force $saida | Out-Null
function Norm([string]$s){
  $d = $s.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD); $sb = New-Object Text.StringBuilder
  foreach($ch in $d.ToCharArray()){ if([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne 'NonSpacingMark'){ [void]$sb.Append($ch) } }
  return ($sb.ToString() -replace '[^a-z0-9]', '')
}
# itens do PCI que NÃO são vaga de emprego (seleção de ALUNOS etc.) — ficam de fora do mapa (revisão de 15/10/2026)
$EXCLUIR = @('fundacao-paulistana-sp-abre-processo-seletivo-para-cursos-tecnicos')   # vagas de aluno em cursos técnicos
# nomes que o PCI escreve diferente do IBGE (nome no PCI ➔ nome no IBGE, já normalizados)
$APELIDO = @{ 'ares'='arez'; 'boasaude'='januariocicco' }
function Js([string]$s){ return '"' + ($s -replace '\\','\\' -replace '"','\"') + '"' }
foreach($arq in Get-ChildItem $dir -Filter *.tsv){
  $uf = $arq.BaseName
  $cod = @{}; $txt = [IO.File]::ReadAllText((Join-Path $Site "noticias\municipios\$uf.js"), $utf8)
  foreach($x in [regex]::Matches($txt, "c:'(\d{7})',n:'((?:[^'\\]|\\.)*)'")){ $cod[(Norm ($x.Groups[2].Value -replace "\\'", "'"))] = $x.Groups[1].Value }
  $por = [ordered]@{}; $semCod = @{}; $n = 0
  foreach($l in [IO.File]::ReadAllLines($arq.FullName, $utf8)){
    $f = $l.Split("`t"); if($f.Count -lt 11 -or $f[10] -eq 'vazio' -or $EXCLUIR -contains $f[9]){ continue }
    $c = $cod[(Norm $f[1])]; if(-not $c){ $c = $cod[(Norm ($f[0] -replace '-',' '))] }
    if(-not $c -and $APELIDO.ContainsKey((Norm $f[1]))){ $c = $cod[$APELIDO[(Norm $f[1])]] }
    if(-not $c){ $semCod[$f[1]] = 1; continue }
    if(-not $por.Contains($c)){ $por[$c] = New-Object Collections.ArrayList }
    $campos = @((Js $f[2]), (Js $f[3]), (Js $f[4]), [string][int]$f[5], (Js $f[6]), (Js $f[7]), (Js $f[8]), (Js $f[9]))
    $item = '[' + ($campos -join ',') + ']'
    if(-not ($por[$c] -contains $item)){ [void]$por[$c].Add($item); $n++ }
  }
  $sb = New-Object Text.StringBuilder
  [void]$sb.AppendLine("/* Concursos por cidade — $uf. Fonte: PCI Concursos (pciconcursos.com.br/concursos/$($uf.ToLower())/<cidade>), últimos 12 meses.")
  [void]$sb.AppendLine("   Gerado por levantamento-concursos/gerar-cidades.ps1 em $Data. Não editar à mão. */")
  [void]$sb.AppendLine("CONC_CIDADES['$uf'] = { atualizado:'$Data', c:{")
  foreach($c in $por.Keys){ [void]$sb.AppendLine("'$c':[" + ($por[$c] -join ',') + '],') }
  [void]$sb.AppendLine('}};')
  [IO.File]::WriteAllText((Join-Path $saida "$uf.js"), $sb.ToString(), $utf8)
  "$uf`: $n concursos em $($por.Count) cidades" + $(if($semCod.Count){ " · SEM CÓDIGO IBGE: " + ($semCod.Keys -join ', ') } else { '' })
}
