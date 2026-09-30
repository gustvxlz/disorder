$outputDirectory = Join-Path $PSScriptRoot 'audio\legacy-tts'
$outputDirectory = [System.IO.Path]::GetFullPath($outputDirectory)
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$voice = New-Object -ComObject SAPI.SpVoice
$voice.Voice = $voice.GetVoices() | Where-Object { $_.GetDescription() -like '*Maria*' } | Select-Object -First 1
$voice.Rate = -1
$lines = @{
  'supervisor-1' = 'Você ainda está aí?'
  'supervisor-2' = 'Falta o Arquivo B.'
  'supervisor-3' = 'Confere as caixas da prateleira três e lança no protocolo.'
  'supervisor-4' = 'Depois disso você pode ir.'
  'marta-1' = 'Você ainda está conferindo o arquivo?'
  'marta-2' = 'Eu termino essas pastas e vou embora.'
}
foreach ($entry in $lines.GetEnumerator()) {
  $stream = New-Object -ComObject SAPI.SpFileStream
  $stream.Format.Type = 18
  $stream.Open((Join-Path $outputDirectory ($entry.Key + '.wav')), 3, $false)
  $voice.AudioOutputStream = $stream
  $voice.Speak($entry.Value) | Out-Null
  $stream.Close()
}
Write-Output 'Six original Portuguese speech clips generated with the installed Microsoft Maria voice, 16 kHz mono.'
