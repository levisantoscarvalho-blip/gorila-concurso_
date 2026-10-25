# ════════════════════════════════════════════
# ROBÔ AUDITOR (pedido do Levi, 18/10/2026: "um robô inteligente para encontrar erros estruturais" — nasceu do caso do
# TCE-MA, que sumia do mapa por causa de um corte de 12 meses que ninguém via). Ele NÃO coleta concursos: examina o que
# o robô coletor trouxe e procura sinais de que algo está errado NA ESTRUTURA (regra, leitura, cobertura), não num
# concurso só. Escreve auditoria.txt e uma linha de resumo no relatório do robô. NUNCA impede a publicação.
#   ERRO     = o robô está perdendo ou estragando dados (corrigir o código)
#   CONFERIR = parece estranho; uma pessoa olha (pode ser real, ex.: órgão que não abre concurso há anos)
#   INFO     = limite conhecido, para saber
# Regras:
#   1. LEITURA    — a página da cidade tinha N concursos e o robô leu menos (o PCI mudou o jeito de escrever algum item)
#   2. RESPOSTA   — cidades que não responderam na coleta
#   3. LIMITE     — cidades no limite de 200 do PCI (os mais antigos não aparecem)
#   4. COBERTURA  — cidades que existem no PCI e não estão no levantamento (só com -Completo: consulta o PCI)
#   5. ÓRGÃOS     — órgãos que todo estado tem (TCE, TJ, MP, Defensoria, PM, PC, Bombeiros, Fazenda, Assembleia, TRE, TRT,
#                   universidade federal, instituto federal, Detran, prefeitura da capital) sem NENHUM concurso no levantamento
#   6. CAPITAL    — capital com bem menos concursos que a maior cidade do estado (ou nenhum)
#   7. QUEDAS     — cidade que tinha 10+ concursos e perdeu mais da metade desde a versão no ar
#   8. REPETIDOS  — o mesmo concurso duas vezes na mesma cidade
#   9. DATAS      — fim de inscrição antes de 2000 ou início depois do fim
#  10. PREVISTOS  — previstos (manuais) com notícia de mais de 1 ano e ainda sem edital
# Uso: .\auditar.ps1            (o robô diário chama sozinho)
#      .\auditar.ps1 -Completo  (também consulta a lista de cidades do PCI — o robô faz isso no domingo)
# ════════════════════════════════════════════
param([switch]$Completo, [string]$Site = (Join-Path $PSScriptRoot '..\site'), [string]$Pasta)   # -Pasta: outra pasta de cidades (teste)
. (Join-Path $PSScriptRoot 'comum.ps1')
$ErrorActionPreference = 'Continue'
$dir = $PSScriptRoot; $pasta = if($Pasta){ $Pasta } else { Join-Path $dir 'pci-cidades' }; $agora = Agora
$erros = New-Object Collections.ArrayList; $conferir = New-Object Collections.ArrayList; $info = New-Object Collections.ArrayList
function Erro([string]$s){ [void]$erros.Add($s) }; function Conferir([string]$s){ [void]$conferir.Add($s) }; function Info([string]$s){ [void]$info.Add($s) }
$raiz = (Resolve-Path (Join-Path $dir '..\..')).Path; $temGit = [bool](Get-Command git -ErrorAction SilentlyContinue)
$CAPITAL = @{AC='Rio Branco';AL='Maceió';AM='Manaus';AP='Macapá';BA='Salvador';CE='Fortaleza';DF='Brasília';ES='Vitória';GO='Goiânia';MA='São Luís';MG='Belo Horizonte';MS='Campo Grande';MT='Cuiabá';PA='Belém';PB='João Pessoa';PE='Recife';PI='Teresina';PR='Curitiba';RJ='Rio de Janeiro';RN='Natal';RO='Porto Velho';RR='Boa Vista';RS='Porto Alegre';SC='Florianópolis';SE='Aracaju';SP='São Paulo';TO='Palmas'}
# órgãos que TODO estado tem e que costumam abrir concurso (nome ➔ jeitos de escrever no PCI)
$ORGAOS = [ordered]@{
  'Tribunal de Contas'            = 'Tribunal de Contas|\bTCE\b|\bTCM\b|\bTC[EM]-'
  'Tribunal de Justiça'           = 'Tribunal de Justi[çc]a|\bTJ\b|\bTJ-|\bTJ[A-Z]{2}\b'
  'Ministério Público'            = 'Minist[ée]rio P[úu]blico|\bMP\b|\bMP-|\bMPE\b|\bMP[A-Z]{2}\b'
  'Defensoria Pública'            = 'Defensoria|\bDPE\b|\bDPE-'
  'Polícia Militar'               = 'Pol[íi]cia Militar|\bPM\b|\bPM-|\bPM[A-Z]{2}\b'
  'Polícia Civil'                 = 'Pol[íi]cia Civil|\bPC\b|\bPC-|\bPC[A-Z]{2}\b|\bPJC\b'
  'Corpo de Bombeiros'            = 'Bombeiro|\bCBM'
  'Fazenda / Receita estadual'    = 'Fazenda|SEFAZ|SEFIN|Receita Estadual|\bSEF\b|Economia e Planejamento'
  'Assembleia Legislativa'        = 'Assembl[ée]ia Legislativa|\bALE[A-Z]{0,3}\b|\bAL-|C[âa]mara Legislativa'
  'Tribunal Regional Eleitoral'   = 'Tribunal Regional Eleitoral|\bTRE\b|\bTRE-'
  'Tribunal Regional do Trabalho' = 'Tribunal Regional do Trabalho|\bTRT\b|\bTRT-'
  'Universidade federal'          = 'Universidade Federal|\bUF[A-Z]{1,5}\b|\bUNIR\b|\bUNIFAP\b|\bUNB\b|\bUNIFESP\b|\bUNIRIO\b|\bUTFPR\b|\bFURG\b'
  'Instituto federal'             = 'Instituto Federal|\bIF[A-Z]{1,5}\b|\bCEFET'
  'Detran'                        = 'Detran'
}
$ateHoje = $agora.ToString('yyyy-MM-dd'); $nLinhas = 0

# ── leitura dos dados: linhas por estado e por cidade
$porUf = @{}; $abertosUf = @{}; $nomeCid = @{}   # nomeCid[UF][slug] = nome da cidade
foreach($uf in $TODAS_UFS){
  $porUf[$uf] = @{}; $nomeCid[$uf] = @{}; $arq = Join-Path $pasta "$uf.tsv"
  if(-not (Test-Path $arq)){ Erro "$uf`: não existe pci-cidades/$uf.tsv"; continue }
  foreach($l in [IO.File]::ReadAllLines($arq, $utf8)){
    $p = $l.Split("`t"); if($p.Count -lt 11){ continue }
    if(-not $porUf[$uf].ContainsKey($p[0])){ $porUf[$uf][$p[0]] = New-Object Collections.ArrayList; $nomeCid[$uf][$p[0]] = $p[1] }
    if($p[10] -ne 'vazio'){ [void]$porUf[$uf][$p[0]].Add($p); $nLinhas++ }
  }
}
foreach($l in [IO.File]::ReadAllLines((Join-Path $dir 'abertos.txt'), $utf8)){ $p = $l.Split('|'); if($p.Count -ge 7){ if(-not $abertosUf[$p[0]]){ $abertosUf[$p[0]] = New-Object Collections.ArrayList }; [void]$abertosUf[$p[0]].Add($p[1]) } }

# ── 1, 2, 3. LEITURA, RESPOSTA e LIMITE (arquivo <UF>.leitura, gravado na coleta completa)
$semLeitura = 0; $noLimite = New-Object Collections.ArrayList; $naoResp = New-Object Collections.ArrayList; $malLidas = 0
foreach($uf in $TODAS_UFS){
  $arq = Join-Path $pasta "$uf.leitura"; if(-not (Test-Path $arq)){ $semLeitura++; continue }
  $ult = @{}; foreach($l in [IO.File]::ReadAllLines($arq, $utf8)){ $p = $l.Split("`t"); if($p.Count -ge 2){ $ult[$p[0]] = $p } }   # vale a última tentativa
  foreach($sl in $ult.Keys){ $p = $ult[$sl]
    if($p[1] -eq 'ERRO'){ [void]$naoResp.Add("$uf/$sl"); continue }
    $bruto = [int]$p[1]; $lidos = [int]$p[2]
    if($lidos -lt $bruto){ $malLidas++; Erro "LEITURA $uf/$sl`: a página do PCI tinha $bruto concursos e o robô leu só $lidos — algum item mudou de formato (ver ItensPci em comum.ps1)" }
    if($bruto -ge $PCI_MAX_CIDADE){ [void]$noLimite.Add("$uf/$sl") }
  }
}
if($semLeitura -eq 27){ Info "LEITURA: ainda sem dados de leitura (são gravados na coleta completa de domingo)" }
elseif($semLeitura){ Info "LEITURA: $semLeitura estados ainda sem dados de leitura" }
if($naoResp.Count){ Conferir "RESPOSTA: $($naoResp.Count) cidades não responderam na última coleta completa (ficaram com os dados anteriores): $(($naoResp | Select-Object -First 15) -join ', ')$(if($naoResp.Count -gt 15){' …'})" }
if($noLimite.Count){ Info "LIMITE: $($noLimite.Count) cidades têm 200 concursos ou mais no PCI, que só mostra os 200 mais recentes — os mais antigos delas não aparecem: $(($noLimite | Select-Object -First 12) -join ', ')$(if($noLimite.Count -gt 12){' …'})" }

# ── 4. COBERTURA: cidades do PCI que não estão no levantamento (consulta o PCI: só na coleta completa)
if($Completo){
  foreach($uf in $TODAS_UFS){
    $cid = CidadesPci $uf; Start-Sleep -Milliseconds 400
    if(-not $cid){ Conferir "COBERTURA $uf`: não consegui ler a lista de cidades do PCI"; continue }
    $faltam = @($cid | Where-Object { -not $porUf[$uf].ContainsKey($_.slug) })
    if($faltam.Count){ Erro "COBERTURA $uf`: $($faltam.Count) cidades do PCI não estão no levantamento: $((($faltam | Select-Object -First 10) | ForEach-Object { $_.nome }) -join ', ')$(if($faltam.Count -gt 10){' …'})" }
  }
}

# ── 5. ÓRGÃOS que todo estado tem, sem nenhum concurso no levantamento
foreach($uf in $TODAS_UFS){
  $textos = New-Object Collections.ArrayList
  foreach($k in $porUf[$uf].Keys){ foreach($p in $porUf[$uf][$k]){ [void]$textos.Add("$($p[2]) $($p[9] -replace '-',' ')") } }
  foreach($o in @($abertosUf[$uf])){ if($o){ [void]$textos.Add($o) } }
  $tudo = $textos -join "`n"
  $faltam = @($ORGAOS.Keys | Where-Object { $tudo -notmatch $ORGAOS[$_] })
  if($faltam.Count){ Conferir "ÓRGÃOS $uf`: nenhum concurso de $($faltam -join ', ') no levantamento — é real (órgão sem concurso no PCI) ou o robô está perdendo?" }
  # prefeitura da capital
  $capSlug = $nomeCid[$uf].Keys | Where-Object { (Norm $nomeCid[$uf][$_]) -eq (Norm $CAPITAL[$uf]) } | Select-Object -First 1
  $capNorm = Norm $CAPITAL[$uf]
  if($uf -ne 'DF' -and $capSlug -and -not (@($porUf[$uf][$capSlug]) | Where-Object { (Norm $_[2]) -match "prefeitura.*$capNorm|^pm$capNorm|secretariamunicipal" })){ Conferir "ÓRGÃOS $uf`: nenhum concurso da Prefeitura de $($CAPITAL[$uf]) no levantamento" }
}

# ── 6. CAPITAL bem menor que a maior cidade do estado
foreach($uf in $TODAS_UFS){
  $cont = @{}; $nomes = $nomeCid[$uf]
  foreach($k in $porUf[$uf].Keys){ $cont[$k] = $porUf[$uf][$k].Count }
  $cap = $cont.Keys | Where-Object { $nomes[$_] -and (Norm $nomes[$_]) -eq (Norm $CAPITAL[$uf]) } | Select-Object -First 1
  $maior = $cont.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1
  if(-not $cap){ Erro "CAPITAL $uf`: $($CAPITAL[$uf]) não tem nenhum concurso no levantamento"; continue }
  if($maior -and $maior.Name -ne $cap -and $cont[$cap] -lt 0.5 * $maior.Value){ Conferir "CAPITAL $uf`: $($CAPITAL[$uf]) tem $($cont[$cap]) concursos e $($nomes[$maior.Name]) tem $($maior.Value) — a capital deveria ter mais" }
}

# ── 7. QUEDAS desde a versão no ar
if($temGit){
  foreach($uf in $TODAS_UFS){
    $velho = git -C $raiz show "HEAD:Html_Gorilaconcurso/levantamento-concursos/pci-cidades/$uf.tsv" 2>$null; if($LASTEXITCODE -ne 0 -or -not $velho){ continue }
    $antes = @{}; foreach($l in $velho){ $p = $l.Split("`t"); if($p.Count -ge 11 -and $p[10] -ne 'vazio'){ $antes[$p[0]] = 1 + [int]$antes[$p[0]] } }
    foreach($k in $antes.Keys){ $agoraN = if($porUf[$uf].ContainsKey($k)){ $porUf[$uf][$k].Count } else { 0 }
      if($antes[$k] -ge 10 -and $agoraN -lt 0.5 * $antes[$k]){ Conferir "QUEDA $uf/$k`: tinha $($antes[$k]) concursos no ar e agora tem $agoraN" } }
  }
}

# ── 8 e 9. REPETIDOS e DATAS
$rep = 0; $datasRuins = 0; $exDatas = New-Object Collections.ArrayList
foreach($uf in $TODAS_UFS){ foreach($k in $porUf[$uf].Keys){
  $vistos = @{}; foreach($p in $porUf[$uf][$k]){
    if($vistos.ContainsKey($p[9])){ $rep++ } else { $vistos[$p[9]] = 1 }
    if(($p[8] -and $p[8] -lt '2000-01-01') -or ($p[7] -and $p[8] -and $p[7] -gt $p[8])){ $datasRuins++; if($exDatas.Count -lt 5){ [void]$exDatas.Add("$uf/$k $($p[7])>$($p[8]) $($p[9])") } }
  } } }
if($rep){ Conferir "REPETIDOS: $rep concursos aparecem duas vezes na mesma cidade" }
if($datasRuins){ Conferir "DATAS: $datasRuins concursos com data impossível na fonte (o gerador corrige ou tira do mapa). Ex.: $($exDatas -join ' · ')" }

# ── 10. PREVISTOS antigos (lista manual)
$limitePrev = $agora.AddYears(-1).ToString('yyyy-MM-dd'); $velhos = New-Object Collections.ArrayList
foreach($a in 'previstos.txt'){ foreach($l in [IO.File]::ReadAllLines((Join-Path $dir $a), $utf8)){ if(-not $l -or $l.StartsWith('#')){ continue }; $p = $l.Split('|')
  if($p.Count -ge 8 -and $p[7] -match '^(\d{2})/(\d{2})/(\d{4})$' -and "$($Matches[3])-$($Matches[2])-$($Matches[1])" -lt $limitePrev){ [void]$velhos.Add("$($p[0]) $($p[2]) (notícia de $($p[7]))") } } }
if($velhos.Count){ Conferir "PREVISTOS: $($velhos.Count) previstos com notícia de mais de 1 ano e ainda sem edital — continuam previstos? $(($velhos | Select-Object -First 8) -join ' · ')$(if($velhos.Count -gt 8){' …'})" }

# ── 11. PREVISTO QUE JÁ ACONTECEU (25/10/2026 — caso SEAP-MA: "previsto, 203 vagas" no mapa, mas o concurso já tinha
#        acontecido em agosto e estava no mapa como encerrado; o mesmo concurso aparecia duas vezes). Procura, para cada
#        previsto, concursos do MESMO órgão no último ano (cidades + abertos estaduais). Achou ➔ CONFERIR (tirar dos previstos?).
$umAno = $agora.AddYears(-1).ToString('yyyy-MM-dd'); $jaAcont = New-Object Collections.ArrayList
$conferidoEm = @{}; $arqConf = Join-Path $dir 'previstos-conferidos.txt'   # previstos que uma pessoa já conferiu (UF|órgão|data|motivo)
if(Test-Path $arqConf){ foreach($l in [IO.File]::ReadAllLines($arqConf, $utf8)){ if(-not $l -or $l.StartsWith('#')){ continue }; $q = $l.Split('|'); if($q.Count -ge 3){ $conferidoEm["$($q[0])|$($q[1])"] = $q[2] } } }
foreach($l in [IO.File]::ReadAllLines((Join-Path $dir 'previstos.txt'), $utf8)){ if(-not $l -or $l.StartsWith('#')){ continue }; $p = $l.Split('|'); if($p.Count -lt 3){ continue }
  $uf = $p[0]; if(-not $porUf.ContainsKey($uf)){ continue }
  # "SEAP-MA (Polícia Penal)" ➔ sigla SEAP · "Polícia Civil do AC" ➔ nome "Polícia Civil"
  $base = (($p[2] -replace '\([^)]*\)', '') -replace "\s*[-–]\s*$uf\b", '' -replace "\s+d[aeo]s?\s+$uf\s*$", '').Trim()
  $sig = if($base -cmatch '^([A-Z]{2,})\b'){ $Matches[1] } else { '' }; $nb = Norm $base
  if(-not $sig -and $nb.Length -lt 8){ continue }
  # cargo do previsto com palavra própria ("Soldado", "Perito", "Técnico de enfermagem") ➔ só conta concurso que tenha
  # alguma dessas palavras no cargo (PM-DF Soldado ≠ Curso de Oficiais). Cargo genérico ("A definir", "Diversos") ➔ qualquer um.
  $pal = @((NormPalavras $p[3]).Trim().Split(' ') | Where-Object { $_.Length -ge 5 -and $_ -notmatch '^(definir|diversos|varios|cargos|areas?|nivel|superior|medio)$' })
  $achou = $null
  foreach($k in $porUf[$uf].Keys){ foreach($r in $porUf[$uf][$k]){
    if(-not $r[8] -or $r[8] -lt $umAno){ continue }
    $ok = if($sig){ $r[2] -cmatch "^$sig\b" } else { (Norm $r[2]).Contains($nb) }
    if($ok -and $pal.Count){ $cr = NormPalavras $r[3]; $ok = [bool]($pal | Where-Object { $cr.Contains(" $_") }) }
    if($ok -and (-not $achou -or $r[8] -gt $achou[8])){ $achou = $r } } }
  if($achou -and $conferidoEm.ContainsKey("$uf|$($p[2])") -and $achou[8] -le $conferidoEm["$uf|$($p[2])"]){ $achou = $null }   # já conferido por uma pessoa
  if($achou){ [void]$jaAcont.Add("$uf $($p[2]) ➔ já teve '$($achou[3])' (inscrições até $($achou[8]), $($achou[1]))") }
}
if($jaAcont.Count){ Conferir "PREVISTO JÁ ACONTECEU? $($jaAcont.Count) previstos cujo órgão já teve concurso no último ano — o previsto é um concurso NOVO ou é o mesmo que já aconteceu (aí tirar de previstos.txt)? $($jaAcont -join ' · ')" }

# ── RESULTADO
$saida = New-Object Collections.ArrayList
[void]$saida.Add("AUDITORIA DO GORILA — $($agora.ToString('dd/MM/yyyy HH:mm')) (horário de Brasília)$(if($Completo){' — com consulta ao PCI'})")
[void]$saida.Add("$nLinhas concursos nas cidades examinados · $($erros.Count) ERROS · $($conferir.Count) para CONFERIR · $($info.Count) INFO")
[void]$saida.Add("ERRO = o robô está perdendo ou estragando dados (corrigir o código) · CONFERIR = uma pessoa olha · INFO = limite conhecido")
foreach($t in @(@('ERROS',$erros), @('CONFERIR',$conferir), @('INFO',$info))){ if($t[1].Count){ [void]$saida.Add(''); [void]$saida.Add("== $($t[0]) =="); foreach($x in $t[1]){ [void]$saida.Add("- $x") } } }
[IO.File]::WriteAllText((Join-Path $dir 'auditoria.txt'), (($saida -join "`r`n") + "`r`n"), $utf8)
"AUDITORIA: $($erros.Count) erros, $($conferir.Count) para conferir, $($info.Count) info (ver auditoria.txt)$(if($malLidas){" — ATENÇÃO: $malLidas cidades com concursos que o robô não conseguiu ler"})"
exit 0
