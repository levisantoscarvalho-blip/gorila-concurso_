# Funções usadas pelos scripts de coleta (baixar-pci-cidades.ps1 e atualizar.ps1). Carregar com:  . (Join-Path $PSScriptRoot 'comum.ps1')
$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'
$utf8 = New-Object Text.UTF8Encoding $false
$TODAS_UFS = @('AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO')
$PCI_HDR = @{ 'User-Agent' = 'Mozilla/5.0 (GorilaConcurso; levantamento de concursos)' }
# hoje no horário de Brasília (o robô do GitHub roda em UTC)
function Agora(){ return [TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, 'E. South America Standard Time') }
# baixa uma página do PCI com até 3 tentativas; $null se não conseguir
function Baixar([string]$url){
  for($t=1; $t -le 3; $t++){
    try { return (Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 40 -Headers $PCI_HDR).Content }
    catch { if($_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -eq 404){ return $null }; if($t -eq 3){ return $null }; Start-Sleep -Seconds (5*$t) }
  }
}
function Limpa([string]$s){ return ([Net.WebUtility]::HtmlDecode(($s -replace '<[^>]+>',' ')) -replace '[<>]','' -replace '\s+',' ').Trim() }
function Norm([string]$s){
  $d = $s.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD); $sb = New-Object Text.StringBuilder
  foreach($ch in $d.ToCharArray()){ if([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne 'NonSpacingMark'){ [void]$sb.Append($ch) } }
  return ($sb.ToString() -replace '[^a-z0-9]', '')
}
# como Norm, mas mantém as PALAVRAS separadas por um espaço (para achar o nome de uma cidade dentro de um título)
function NormPalavras([string]$s){
  $d = $s.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD); $sb = New-Object Text.StringBuilder
  foreach($ch in $d.ToCharArray()){ if([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne 'NonSpacingMark'){ [void]$sb.Append($ch) } }
  return ' ' + (($sb.ToString() -replace '[^a-z0-9]+', ' ').Trim()) + ' '
}
# "19/10 a 03/12/2026" · "15/10/2026" · "Prorrogado até 23/11/2026" ➔ (início, fim) em AAAA-MM-DD
function Datas([string]$s){
  $fim = [regex]::Matches($s, '(\d{2})/(\d{2})/(\d{4})') | Select-Object -Last 1
  if(-not $fim){ return $null }
  $ate = "$($fim.Groups[3].Value)-$($fim.Groups[2].Value)-$($fim.Groups[1].Value)"; $de = ''
  if($s -match '^\s*(\d{2})/(\d{2})(?:/(\d{4}))?\s+a\s+'){ $ano = if($Matches[3]){ $Matches[3] } else { $fim.Groups[3].Value }; $de = "$ano-$($Matches[2])-$($Matches[1])" }
  return @($de, $ate)
}
# um concurso na lista do PCI (página de cidade ou de região): link da notícia, órgão, (UF), vagas/cargo/nível, datas
$rxItem = [regex]'<div class="(\w+)" onclick="myClick\(event\)" data-url="https://www\.pciconcursos\.com\.br/noticias/([^"]+)"[\s\S]*?<div class="ca"><a ([^>]*)>([\s\S]*?)</a>[\s\S]*?(?:<div class="cc">([^<]*)</div>[\s\S]*?)?<div class="cd">([\s\S]*?)</div>\s*<div class="ce">([\s\S]*?)</div>'
# lê os concursos de um trecho de HTML ➔ objetos { classe, slug, titulo, orgao, uf, vagas, cr, cargo, nivel, de, ate }
function ItensPci([string]$html){
  foreach($m in $rxItem.Matches($html)){
    # SEM DATA: o PCI escreve uma frase no lugar ("Suspenso", "Cancelado", "Adiado início", "Inscrições adiadas",
    # "Conferir suspensão por edital", "Conferir período no edital", "Somente para Doadores de Sangue", "Edital n° 01/2015"...).
    # Regra geral (25/10/2026 — antes era frase por frase e o auditor acusava cada frase nova):
    #   suspensão ou adiamento ➔ SUSPENSO (entra no mapa, âmbar: parado, pode voltar) · cancelado ➔ lido e descartado ·
    #   qualquer outra frase ➔ 'semdata': lido e descartado (sem data não dá para saber se está aberto).
    # O AUDITOR continua pegando mudança de FORMATO da página (item que nem chega aqui: lidos < bruto).
    $sit = ''; $d = Datas (Limpa $m.Groups[7].Value)
    if(-not $d){ $t = Limpa $m.Groups[7].Value
      $sit = if($t -match '(?i)suspens|adiad'){ 'suspenso' } elseif($t -match '(?i)cancel'){ 'cancelado' } else { 'semdata' }
      $d = @('', '') }
    $partes = $m.Groups[6].Value -split '<br\s*/?>'
    $vagasTxt = Limpa $partes[0]; $cargo = if($partes.Count -gt 1){ Limpa $partes[1] } else { '' }; $nivel = if($partes.Count -gt 2){ Limpa $partes[2] } else { '' }
    $v = 0; if($vagasTxt -match '^([\d\.]+)\s+vaga'){ $v = [int]($Matches[1] -replace '\.','') }
    [pscustomobject]@{ classe=$m.Groups[1].Value; slug=$m.Groups[2].Value; titulo=(Limpa ([regex]::Match($m.Groups[3].Value, 'title="([^"]*)"').Groups[1].Value)); orgao=(Limpa $m.Groups[4].Value)
      uf=(Limpa $m.Groups[5].Value); vagas=$v; cr=$(if($vagasTxt -match 'reserva'){ 'CR' } else { '' }); cargo=$cargo; nivel=$nivel; de=$d[0]; ate=$d[1]; sit=$sit }
  }
}
# linhas do .tsv de uma cidade (formato de pci-cidades/UF.tsv); $null = erro ao baixar
# SEM CORTE DE DATA desde 18/10/2026 (pedido do Levi: "literalmente todos os concursos possíveis") — guarda tudo o que a
# página da cidade mostra (o PCI mostra no máximo os 200 mais recentes; em capitais isso vai até ~2018). $desde só se alguém pedir.
# Para o AUDITOR (auditar.ps1): $script:Leitura = quantos concursos a página TINHA (bruto) e quantos o robô CONSEGUIU LER (lidos).
# Se lidos < bruto, o jeito do PCI escrever algum item mudou e o robô está perdendo concursos sem perceber.
$PCI_MAX_CIDADE = 200
function LinhasCidade([string]$uf, [string]$slug, [string]$nome, [string]$desde){
  $html = Baixar "https://www.pciconcursos.com.br/concursos/$($uf.ToLower())/$slug"
  if(-not $html){ return $null }
  $linhas = New-Object Collections.ArrayList; $lidos = 0
  foreach($i in (ItensPci $html)){
    $lidos++
    if($i.sit -eq 'cancelado' -or $i.sit -eq 'semdata' -or ($desde -and $i.ate -and $i.ate -lt $desde) -or $i.slug -notmatch '^[a-z0-9\-]+$'){ continue }
    $classe = if($i.sit){ $i.sit } else { $i.classe }   # suspenso: a coluna "classe" leva a palavra (gerar-cidades.ps1 entende)
    [void]$linhas.Add((($slug, $nome, $i.orgao, $i.cargo, $i.nivel, $i.vagas, $i.cr, $i.de, $i.ate, $i.slug, $classe) -join "`t"))
  }
  $script:Leitura = @{ bruto = [regex]::Matches($html, 'onclick="myClick\(event\)" data-url="https://www\.pciconcursos\.com\.br/noticias/').Count; lidos = $lidos }
  if(-not $linhas.Count){ [void]$linhas.Add((($slug, $nome, '', '', '', 0, '', '', '', '', 'vazio') -join "`t")) }   # marca a cidade como feita
  return ,$linhas
}
# cidades de um estado no PCI: [ { slug, nome } ]
function CidadesPci([string]$uf){
  $u = $uf.ToLower(); $idx = Baixar "https://www.pciconcursos.com.br/concursos/$u/"
  if(-not $idx){ return $null }
  $l = [regex]::Matches($idx, '<a href="https://www\.pciconcursos\.com\.br/concursos/' + $u + '/([a-z0-9\-]+)"[^>]*>([^<]+)</a>') | ForEach-Object { [pscustomobject]@{ slug=$_.Groups[1].Value; nome=[Net.WebUtility]::HtmlDecode($_.Groups[2].Value).Trim() } }
  return @($l | Group-Object slug | ForEach-Object { $_.Group[0] })
}
