# Baixa, cidade por cidade, a página de concursos do PCI Concursos (pciconcursos.com.br/concursos/<uf>/<cidade>)
# e guarda os concursos dos últimos 12 meses em <Dir>/<UF>.tsv (uma linha por concurso).
# O robots.txt do PCI permite /concursos/. Uma página por vez, com pausa, para não sobrecarregar o site.
# Retoma de onde parou: cidades que já estão no .tsv são puladas.
# Uso:  .\baixar-pci-cidades.ps1 -Ufs SP,MG    (sem -Ufs = todos os estados)
#       -Dir outra-pasta  (o robô semanal baixa tudo numa pasta nova e só troca se a coleta der certo)
param([string[]]$Ufs, [string]$Desde, [int]$PausaMs = 400, [string]$Dir)
. (Join-Path $PSScriptRoot 'comum.ps1')
if(-not $Ufs){ $Ufs = $TODAS_UFS }
if(-not $Desde){ $Desde = (Agora).AddYears(-1).ToString('yyyy-MM-dd') }
if(-not $Dir){ $Dir = Join-Path $PSScriptRoot 'pci-cidades' }
New-Item -ItemType Directory -Force $Dir | Out-Null
foreach($uf in $Ufs){
  $arq = Join-Path $Dir "$uf.tsv"; $feitas = @{}
  if(Test-Path $arq){ foreach($l in [IO.File]::ReadAllLines($arq, $utf8)){ $feitas[$l.Split("`t")[0]] = 1 } }
  $cidades = CidadesPci $uf
  if(-not $cidades){ "$uf ERRO ao baixar a lista de cidades"; continue }
  "$uf`: $($cidades.Count) cidades ($($feitas.Count) já feitas)"
  $n = 0; $erros = 0
  foreach($c in $cidades){
    if($feitas.ContainsKey($c.slug)){ continue }
    $linhas = LinhasCidade $uf $c.slug $c.nome $Desde
    Start-Sleep -Milliseconds $PausaMs
    if($null -eq $linhas){ $erros++; "  $uf/$($c.slug): ERRO (será tentada de novo na próxima vez)"; continue }
    [IO.File]::AppendAllText($arq, (($linhas -join "`n") + "`n"), $utf8)
    $n++; if($n % 100 -eq 0){ "  $uf`: $n cidades nesta rodada" }
  }
  "$uf pronto ($n cidades nesta rodada, $erros erros)"
}
