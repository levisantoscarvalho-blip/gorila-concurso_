# Transforma pci-cidades/<UF>.tsv (baixado por baixar-pci-cidades.ps1) em site/noticias/concursos-cidades/<UF>.js:
#   CONC_CIDADES['UF'] = { atualizado:'DD/MM/AAAA', c:{ 'código IBGE': [ [órgão, cargo, nível, vagas, CR, início, fim, link], ... ] } }
# O site carrega o arquivo do estado só quando o estado é aberto. A situação (aberto/encerrado) é calculada pela data.
param([string]$Site = (Join-Path $PSScriptRoot '..\site'), [string]$Data = (Get-Date -Format 'dd/MM/yyyy'), [string]$Desde = '')
# TRAVAS DE QUALIDADE (robô diário, 15/10/2026): entram TODOS os concursos que o PCI mostra (sem corte de data desde 18/10/2026;
# -Desde AAAA-MM-DD só se alguém quiser cortar) com fim de inscrição até 18 meses à frente (mais que isso = erro de digitação na fonte, ex.: IFMG "29/09/2029"); início depois do fim perde o início; mais de 5.000 vagas vira
# "a definir" até alguém conferir e pôr o link em conferidos.txt. Cada caso sai como "AVISO" no relatório do robô.
$limite = (Get-Date).AddMonths(18).ToString('yyyy-MM-dd')
$CONFERIDOS = @(); $arqConf = Join-Path $PSScriptRoot 'conferidos.txt'
if(Test-Path $arqConf){ $CONFERIDOS = @([IO.File]::ReadAllLines($arqConf, (New-Object Text.UTF8Encoding $false)) | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object { ($_ -split '\s')[0] }) }
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
$APELIDO = @{ 'ares'='arez'; 'boasaude'='januariocicco'; 'baraodemontealto'='baraodomontealto'; 'santoantoniodoleverger'='santoantoniodeleverger'; 'acu'='assu'; 'saoluiz'='saoluizdoanaua'; 'grachocardoso'='gracchocardoso' }   # 19/10/2026: 5 cidades que sumiam (SEM CÓDIGO IBGE no relatório)
function Js([string]$s){ return '"' + ($s -replace '[<>]','' -replace '[\r\n  ]+',' ' -replace '\\','\\' -replace '"','\"') + '"' }   # sem < > nem quebra de linha (segurança)
foreach($arq in Get-ChildItem $dir -Filter *.tsv){
  $uf = $arq.BaseName
  $cod = @{}; $txt = [IO.File]::ReadAllText((Join-Path $Site "noticias\municipios\$uf.js"), $utf8)
  foreach($x in [regex]::Matches($txt, "c:'(\d{7})',n:'((?:[^'\\]|\\.)*)'")){ $cod[(Norm ($x.Groups[2].Value -replace "\\'", "'"))] = $x.Groups[1].Value }
  $por = [ordered]@{}; $semCod = @{}; $n = 0
  foreach($l in [IO.File]::ReadAllLines($arq.FullName, $utf8)){
    $f = $l.Split("`t"); if($f.Count -lt 11 -or $f[10] -eq 'vazio' -or $EXCLUIR -contains $f[9]){ continue }
    if($f[9] -notmatch '^[a-z0-9\-]+$'){ "AVISO $uf link estranho, fora: $($f[9])"; continue }
    $susp = $f[10] -eq 'suspenso'   # suspenso (desde 18/10/2026): não tem data; vai com "suspenso" no 9º campo
    if(-not $susp -and ($f[8] -notmatch '^\d{4}-\d{2}-\d{2}$' -or $f[8] -gt $limite)){ "AVISO $uf data impossível ($($f[8])), fora: $($f[9])"; continue }
    if($Desde -and $f[8] -lt $Desde){ continue }
    if($f[7] -and ($f[7] -notmatch '^\d{4}-\d{2}-\d{2}$' -or $f[7] -gt $f[8])){ "AVISO $uf início depois do fim ($($f[7]) > $($f[8])), início apagado: $($f[9])"; $f[7] = '' }
    if([int]$f[5] -gt 5000 -and $CONFERIDOS -notcontains $f[9]){ "AVISO $uf $($f[5]) vagas sem conferência, ficou 'a definir': $($f[9])"; $f[5] = '0' }
    $c = $cod[(Norm $f[1])]; if(-not $c){ $c = $cod[(Norm ($f[0] -replace '-',' '))] }
    if(-not $c -and $APELIDO.ContainsKey((Norm $f[1]))){ $c = $cod[$APELIDO[(Norm $f[1])]] }
    if(-not $c){ $semCod[$f[1]] = 1; continue }
    if(-not $por.Contains($c)){ $por[$c] = New-Object Collections.ArrayList }
    $campos = @((Js $f[2]), (Js $f[3]), (Js $f[4]), [string][int]$f[5], (Js $f[6]), (Js $f[7]), (Js $f[8]), (Js $f[9])) + $(if($susp){ @('"suspenso"') } else { @() })
    $item = '[' + ($campos -join ',') + ']'
    if(-not ($por[$c] -contains $item)){ [void]$por[$c].Add($item); $n++ }
  }
  $sb = New-Object Text.StringBuilder
  [void]$sb.AppendLine("/* Concursos por cidade — $uf. Fonte: PCI Concursos (pciconcursos.com.br/concursos/$($uf.ToLower())/<cidade>), todos os que a página mostra (até 200 por cidade).")
  [void]$sb.AppendLine("   Gerado por levantamento-concursos/gerar-cidades.ps1 em $Data. Não editar à mão. */")
  [void]$sb.AppendLine("CONC_CIDADES['$uf'] = { atualizado:'$Data', c:{")
  foreach($c in $por.Keys){ [void]$sb.AppendLine("'$c':[" + ($por[$c] -join ',') + '],') }
  [void]$sb.AppendLine('}};')
  [IO.File]::WriteAllText((Join-Path $saida "$uf.js"), $sb.ToString(), $utf8)
  "$uf`: $n concursos em $($por.Count) cidades" + $(if($semCod.Count){ " · SEM CÓDIGO IBGE: " + ($semCod.Keys -join ', ') } else { '' })
}
