# ════════════════════════════════════════════
# ROBÔ DE ATUALIZAÇÃO DOS CONCURSOS (pedido do Levi, 15/10/2026: "atualizações constantes sem eu precisar mexer e que
# os dados sejam verídicos"). Roda sozinho no GitHub todo dia às 4h (.github/workflows/atualizar-concursos.yml);
# também pode rodar à mão:  .\atualizar.ps1            (diário)
#                           .\atualizar.ps1 -Completo  (semanal: baixa de novo TODAS as ~5.570 cidades)
# DIÁRIO
#   1. lê as 5 páginas por região do PCI (todos os concursos com inscrições abertas no Brasil);
#   2. concurso NOVO ➔ acha a cidade pelo nome no título/órgão e baixa a página daquela cidade no PCI (confirma que ele
#      está lá); se não estiver em cidade nenhuma, entra em abertos.txt (órgão estadual/federal ➔ ponto na capital);
#      DATA QUE MUDOU (prorrogação/retificação) ➔ baixa de novo a cidade e a notícia;
#   3. baixa só as notícias novas (fatos do edital: salário, taxa, banca, prova...);
#   4. gera os arquivos do site, com as travas de qualidade (datas impossíveis, vagas exageradas, salários impossíveis);
#   5. verificar.ps1 confere tudo contra a versão no ar — se algo parecer quebrado, PARA (exit 1) e nada é publicado.
#   (antes da conferência, o AUDITOR — auditar.ps1 — procura erros estruturais e escreve auditoria.txt; não impede publicar)
# DESDE 18/10/2026 NÃO HÁ CORTE DE DATA: o mapa guarda tudo o que a página de cada cidade do PCI mostra (até 200 por cidade).
# SEMANAL (-Completo): antes de tudo, baixa todas as cidades numa pasta nova (4 ao mesmo tempo); só troca a pasta
#   antiga se a coleta nova tiver pelo menos 90% dos concursos da antiga.
# Tudo o que aconteceu fica em relatorio-robo.txt (publicado junto, para conferir depois).
# ════════════════════════════════════════════
param([switch]$Completo, [int]$PausaMs = 400)
. (Join-Path $PSScriptRoot 'comum.ps1')
$dir = $PSScriptRoot; $site = Join-Path $dir '..\site'
$agora = Agora; $dataBR = $agora.ToString('dd/MM/yyyy'); $desde = '';   # SEM corte de data desde 18/10/2026 (antes: só os últimos 12 meses)
$limite = $agora.AddMonths(18).ToString('yyyy-MM-dd')   # inscrição até depois disso = erro de digitação na fonte
$rel = New-Object Collections.ArrayList
function Anota([string]$s){ [void]$rel.Add($s); Write-Host $s }
function Fim([int]$codigo){ [IO.File]::WriteAllText((Join-Path $dir 'relatorio-robo.txt'), ($rel -join "`r`n") + "`r`n", $utf8); exit $codigo }
Anota "ROBÔ DO GORILA — $($agora.ToString('dd/MM/yyyy HH:mm')) (horário de Brasília)$(if($Completo){' — coleta COMPLETA (semanal)'})"
trap { Anota "ERRO inesperado: $_"; Fim 1 }

# ── 0. SEMANAL: todas as cidades de novo, numa pasta nova
$pastaCid = Join-Path $dir 'pci-cidades'
function ContaLinhas([string]$pasta){ $n=0; foreach($f in Get-ChildItem $pasta -Filter *.tsv -ErrorAction SilentlyContinue){ foreach($l in [IO.File]::ReadAllLines($f.FullName,$utf8)){ if($l -notmatch "`tvazio$"){ $n++ } } }; return $n }
if($Completo){
  $novo = Join-Path $dir 'pci-cidades-novo'; if(Test-Path $novo){ Remove-Item -Recurse -Force $novo }
  $script = Join-Path $dir 'baixar-pci-cidades.ps1'
  $grupos = 0..3 | ForEach-Object { $g = $_; ,@($TODAS_UFS | Where-Object { [array]::IndexOf($TODAS_UFS, $_) % 4 -eq $g }) }
  $jobs = foreach($g in $grupos){ Start-Job -ScriptBlock { param($s,$u,$d,$p,$o) & $s -Ufs $u -Desde $d -PausaMs $p -Dir $o } -ArgumentList $script, $g, $desde, $PausaMs, $novo }
  $saida = $jobs | Wait-Job | Receive-Job; $jobs | Remove-Job
  Anota "coleta completa: $(@($saida | Where-Object { $_ -match 'ERRO' }).Count) cidades com erro na 1ª passada"
  $saida2 = & $script -Ufs $TODAS_UFS -Desde $desde -PausaMs $PausaMs -Dir $novo   # 2ª passada: só as que faltaram
  $ainda = @($saida2 | Where-Object { $_ -match 'ERRO' }); Anota "2ª passada: $($ainda.Count) cidades ainda com erro"
  # cidade que falhou nas 2 passadas FICA COM OS DADOS DA COLETA ANTERIOR (antes ela sumia do mapa até o domingo seguinte)
  $mantidas = 0
  foreach($uf in $TODAS_UFS){
    $aV = Join-Path $pastaCid "$uf.tsv"; $aN = Join-Path $novo "$uf.tsv"; if(-not (Test-Path $aV)){ continue }
    $temN = @{}; if(Test-Path $aN){ foreach($l in [IO.File]::ReadAllLines($aN,$utf8)){ if($l){ $temN[$l.Split("`t")[0]] = 1 } } }
    $falta = @([IO.File]::ReadAllLines($aV,$utf8) | Where-Object { $_ -and -not $temN.ContainsKey($_.Split("`t")[0]) })
    if($falta.Count){ [IO.File]::AppendAllText($aN, (($falta -join "`n") + "`n"), $utf8); $mantidas += @($falta | ForEach-Object { $_.Split("`t")[0] } | Select-Object -Unique).Count }
  }
  if($mantidas){ Anota "$mantidas cidades não responderam e ficaram com os dados da coleta anterior" }
  $nNovo = ContaLinhas $novo; $nVelho = ContaLinhas $pastaCid
  if(@(Get-ChildItem $novo -Filter *.tsv).Count -eq 27 -and $nNovo -ge 0.9*$nVelho){
    Remove-Item -Recurse -Force $pastaCid; Rename-Item $novo 'pci-cidades'; Anota "cidades trocadas: $nNovo concursos (antes $nVelho)"
  } else {
    Anota "AVISO: coleta completa ficou incompleta ($nNovo concursos contra $nVelho antes) — mantive os dados antigos"; Remove-Item -Recurse -Force $novo
  }
}

# ── 1. PÁGINAS POR REGIÃO (abertos hoje)
$abertosPci = [ordered]@{}
foreach($r in 'norte','nordeste','sudeste','sul','centrooeste'){
  $h = Baixar "https://www.pciconcursos.com.br/concursos/$r/"; Start-Sleep -Milliseconds $PausaMs
  if(-not $h){ Anota "ERRO: não consegui ler a página '$r' do PCI — nada foi publicado"; Fim 1 }
  $its = @(ItensPci $h)
  if($its.Count -lt 10){ Anota "ERRO: a página '$r' do PCI veio com só $($its.Count) concursos (o PCI mudou o site?) — nada foi publicado"; Fim 1 }
  foreach($i in $its){ if($i.sit){ continue }; if($i.ate -gt $limite){ Anota "CONFERIR: data de inscrição impossível na fonte ($($i.ate)), não entrou: $($i.slug)"; continue }; if($TODAS_UFS -contains $i.uf -and $i.slug -match '^[a-z0-9\-]+$' -and -not $abertosPci.Contains($i.slug)){ $abertosPci[$i.slug] = $i } }
}
Anota "PCI hoje: $($abertosPci.Count) concursos com inscrições abertas"

# dados atuais: linhas de cada estado (pci-cidades) e a tabela de abertos estaduais
$tsv = @{}; $ondeSlug = @{}
foreach($uf in $TODAS_UFS){
  $arq = Join-Path $pastaCid "$uf.tsv"; $tsv[$uf] = New-Object Collections.ArrayList
  if(Test-Path $arq){ foreach($l in [IO.File]::ReadAllLines($arq,$utf8)){ if(-not $l){ continue }; [void]$tsv[$uf].Add($l); $p=$l.Split("`t"); if($p.Count -ge 11 -and $p[9]){ $ondeSlug[$p[9]] = @{ uf=$uf; cid=$p[0]; nome=$p[1]; ate=$p[8] } } } }
}
$arqAb = Join-Path $dir 'abertos.txt'; $abertos = New-Object Collections.ArrayList
foreach($l in [IO.File]::ReadAllLines($arqAb,$utf8)){ if($l.Trim()){ [void]$abertos.Add($l) } }
$noAb = @{}; for($k=0; $k -lt $abertos.Count; $k++){ $p=$abertos[$k].Split('|'); if($p.Count -ge 7){ $noAb[$p[6]] = $k } }

# cidades de cada estado (IBGE) para achar a cidade pelo nome; e as do PCI (endereço da página da cidade)
$munis = @{}; $pciCid = @{}
function Municipios([string]$uf){
  if(-not $munis.ContainsKey($uf)){
    $txt = [IO.File]::ReadAllText((Join-Path $site "noticias\municipios\$uf.js"), $utf8)
    $munis[$uf] = @([regex]::Matches($txt, "n:'((?:[^'\\]|\\.)*)'") | ForEach-Object { $n = $_.Groups[1].Value -replace "\\'", "'"; [pscustomobject]@{ nome=$n; chave=(NormPalavras $n) } } | Sort-Object { -$_.chave.Length })
  }
  return $munis[$uf]
}
function SlugPci([string]$uf, [string]$nome){
  if(-not $pciCid.ContainsKey($uf)){ $m=@{}; $l = CidadesPci $uf; Start-Sleep -Milliseconds $PausaMs; foreach($c in @($l)){ if($c){ $m[(Norm $c.nome)] = $c.slug } }; $pciCid[$uf] = $m }
  return $pciCid[$uf][(Norm $nome)]
}
# a cidade citada no órgão (melhor) ou no título; o nome mais comprido ganha ("Santa Rita do Sapucaí" antes de "Santa Rita")
function AcharCidade($i){
  foreach($texto in $i.orgao, $i.titulo){
    $t = NormPalavras $texto
    foreach($m in (Municipios $i.uf)){ if($t.Contains($m.chave)){ return $m.nome } }
  }
  return $null
}
$recarregar = [ordered]@{}   # cidades a baixar de novo:  'UF|slug-da-cidade' ➔ nome
$mudou = New-Object Collections.Generic.HashSet[string]; $novosCid = 0; $novosEst = 0; $datasMudaram = 0
$fmt = { param($d) $p = $d.Split('-'); "$($p[2])/$($p[1])/$($p[0])" }
$naoAchados = New-Object Collections.ArrayList
foreach($i in $abertosPci.Values){
  if($ondeSlug.ContainsKey($i.slug)){
    $o = $ondeSlug[$i.slug]
    if($o.ate -ne $i.ate){ $recarregar["$($o.uf)|$($o.cid)"] = $o.nome; [void]$mudou.Add($i.slug); $datasMudaram++ }
    continue
  }
  if($noAb.ContainsKey($i.slug)){
    $k = $noAb[$i.slug]; $p = $abertos[$k].Split('|')
    $datas = if($i.de){ "$(& $fmt $i.de)>$(& $fmt $i.ate)" } else { & $fmt $i.ate }
    if(-not $i.de -and $p[5] -match '^(\d{2}/\d{2}/\d{4})>' -and $p[5].EndsWith('>' + (& $fmt $i.ate))){ $datas = $p[5] }   # a página por região às vezes mostra só o fim: não perde o início que já tínhamos
    if($p[5] -ne $datas){ $p[5] = $datas; $abertos[$k] = $p -join '|'; [void]$mudou.Add($i.slug); $datasMudaram++ }
    continue
  }
  # NOVO: procura a cidade e baixa a página dela no PCI
  $cid = AcharCidade $i; $achou = $false
  if($cid){ $sl = SlugPci $i.uf $cid; if($sl){ $recarregar["$($i.uf)|$sl"] = $cid } }
  [void]$naoAchados.Add([pscustomobject]@{ item=$i; cidade=$cid })
}
# baixa de novo as cidades (novas e com data mudada) e troca as linhas delas
foreach($chave in $recarregar.Keys){
  $uf, $sl = $chave.Split('|'); $nome = $recarregar[$chave]
  $linhas = LinhasCidade $uf $sl $nome $desde; Start-Sleep -Milliseconds $PausaMs
  if($null -eq $linhas){ Anota "AVISO: não consegui baixar a cidade $uf/$sl (fica como estava)"; continue }
  $pos = -1; for($k=0; $k -lt $tsv[$uf].Count; $k++){ if($tsv[$uf][$k].StartsWith("$sl`t")){ $pos = $k; break } }
  $resto = @($tsv[$uf] | Where-Object { -not $_.StartsWith("$sl`t") }); if($pos -lt 0){ $pos = $resto.Count }
  $tsv[$uf] = New-Object Collections.ArrayList; foreach($l in $resto[0..($pos-1)]){ if($pos -gt 0){ [void]$tsv[$uf].Add($l) } }; foreach($l in $linhas){ [void]$tsv[$uf].Add($l) }; if($pos -lt $resto.Count){ foreach($l in $resto[$pos..($resto.Count-1)]){ [void]$tsv[$uf].Add($l) } }
  foreach($l in $linhas){ $p=$l.Split("`t"); if($p[9]){ $ondeSlug[$p[9]] = @{ uf=$uf; cid=$sl; nome=$nome; ate=$p[8] } } }
}
# os novos que não apareceram em cidade nenhuma ➔ abertos.txt (com a cidade, se o órgão é claramente municipal)
$previstos = @(); foreach($a in 'previstos.txt','municipais-previstos.txt'){ foreach($l in [IO.File]::ReadAllLines((Join-Path $dir $a),$utf8)){ if($l -and -not $l.StartsWith('#')){ $p=$l.Split('|'); $previstos += [pscustomobject]@{ uf=$p[0]; org=$(if($a -eq 'previstos.txt'){ $p[2] } else { $p[1] }); arq=$a } } } }
foreach($x in $naoAchados){
  $i = $x.item
  if($ondeSlug.ContainsKey($i.slug)){ $novosCid++ }
  else {
    $municipal = $x.cidade -and ($i.orgao -match '^(Prefeitura|C[âa]mara|Guarda|Servi[çc]o Aut[ôo]nomo|SAAE|Instituto de Previd[êe]ncia)' )
    $vag = if($i.vagas){ $i.vagas } elseif($i.cr){ 'CR' } else { '0' }
    $cargo = ($i.cargo + $(if($i.nivel){ " ($($i.nivel))" })) -replace '\|',' '
    $datas = if($i.de){ "$(& $fmt $i.de)>$(& $fmt $i.ate)" } else { & $fmt $i.ate }
    [void]$abertos.Add((($i.uf, ($i.orgao -replace '\|',' '), $(if($municipal){ $x.cidade } else { '-' }), $vag, $cargo, $datas, $i.slug) -join '|')); $novosEst++
  }
  # tinha previsto com o mesmo órgão? (o edital saiu — conferir e tirar da lista de previstos)
  $no = Norm $i.orgao
  foreach($pv in $previstos){ $np = Norm $pv.org; if($pv.uf -eq $i.uf -and $np.Length -ge 6 -and ($no.Contains($np) -or $np.Contains($no))){ Anota "CONFERIR: '$($pv.org)' ($($pv.uf)) estava em $($pv.arq) e agora abriu inscrições — tirar dos previstos? $($i.slug)" } }
}
Anota "novos concursos: $novosCid em cidades + $novosEst estaduais/sem cidade · $datasMudaram com data mudada (prorrogação/retificação)"
foreach($uf in $TODAS_UFS){ [IO.File]::WriteAllText((Join-Path $pastaCid "$uf.tsv"), (($tsv[$uf] -join "`n") + "`n"), $utf8) }
# abertos com data impossível (mais de 18 meses à frente) saem da tabela; os ANTIGOS FICAM (sem corte de data desde 18/10/2026)
$antes = $abertos.Count
$abertos = @($abertos | Where-Object { $d = [regex]::Matches($_.Split('|')[5], '(\d{2})/(\d{2})/(\d{4})') | Select-Object -Last 1; $iso = if($d){ "$($d.Groups[3].Value)-$($d.Groups[2].Value)-$($d.Groups[1].Value)" }; -not $d -or $iso -le $limite })
if($abertos.Count -lt $antes){ Anota "$($antes - $abertos.Count) concursos estaduais com data impossível saíram de abertos.txt" }
[IO.File]::WriteAllText($arqAb, (($abertos -join "`r`n") + "`r`n"), $utf8)

# ── 3. NOTÍCIAS (detalhes): as que mudaram são baixadas de novo; depois, só as que faltam
$pastaNot = Join-Path $dir 'pci-noticias'
if($mudou.Count){
  foreach($f in Get-ChildItem $pastaNot -Filter 'parte-*.jsonl'){
    $ls = [IO.File]::ReadAllLines($f.FullName,$utf8) | Where-Object { -not ($_ -match '"s":"([^"]+)"' -and $mudou.Contains($Matches[1])) }
    [IO.File]::WriteAllText($f.FullName, (($ls -join "`n") + "`n"), $utf8)
  }
}
$sn = & (Join-Path $dir 'baixar-pci-noticias.ps1') -Parte 0 -Partes 1 -PausaMs $PausaMs -Max 2500; Anota "notícias: $(($sn | Select-Object -Last 1))"

# ── 4. GERA OS ARQUIVOS DO SITE (com as travas de qualidade)
$g1 = & (Join-Path $dir 'gerar.ps1') -Site $site -Dir $dir -Data $dataBR
$g2 = & (Join-Path $dir 'gerar-cidades.ps1') -Site $site -Data $dataBR -Desde $desde
$g3 = & (Join-Path $dir 'gerar-detalhes.ps1') -Site $site
@($g1) + @($g2) + @($g3) | Where-Object { $_ -match 'AVISO|NAO ACHOU: \S|SEM CÓDIGO' } | ForEach-Object { Anota "$_" }

# ── 4b. AUDITOR (auditar.ps1): procura erros ESTRUTURAIS (leitura, cobertura, órgãos faltando...) ➔ auditoria.txt. Nunca impede publicar.
try { $au = & (Join-Path $dir 'auditar.ps1') -Completo:$Completo; Anota "$(@($au)[-1])" } catch { Anota "AVISO: o auditor falhou ($_)" }

# ── 5. CONFERÊNCIA (se falhar, nada é publicado)
$v = & (Join-Path $dir 'verificar.ps1') -Site $site; $ok = $LASTEXITCODE -eq 0
$v | ForEach-Object { Anota "$_" }
if(-not $ok){ Fim 1 }
Fim 0
