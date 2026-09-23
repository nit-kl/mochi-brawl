param(
  [Parameter(Mandatory = $true)] [string] $CharacterId,
  [Parameter(Mandatory = $true)] [string] $SourceSheet,
  [string] $ReferenceSheet = '',
  [string] $NormalAttackSource = ''
)

Add-Type -AssemblyName System.Drawing
$workspace = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$characterDir = Join-Path $workspace "public/assets/characters/$CharacterId"
$conceptDir = Join-Path $characterDir 'concept'
$portraitDir = Join-Path $characterDir 'portraits'
$spriteDir = Join-Path $characterDir 'sprites'
foreach ($dir in @($conceptDir,$portraitDir,$spriteDir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

$cleanSheet = Join-Path $conceptDir 'clean_action_sheet.png'
if ([System.IO.Path]::GetFullPath($SourceSheet) -ne [System.IO.Path]::GetFullPath($cleanSheet)) {
  Copy-Item -LiteralPath $SourceSheet -Destination $cleanSheet -Force
}
if ($ReferenceSheet) {
  $referenceCopy = Join-Path $conceptDir 'chatgpt_reference_sheet.png'
  if ([System.IO.Path]::GetFullPath($ReferenceSheet) -ne [System.IO.Path]::GetFullPath($referenceCopy)) {
    Copy-Item -LiteralPath $ReferenceSheet -Destination $referenceCopy -Force
  }
}

$source = [System.Drawing.Bitmap]::new($SourceSheet)
try {
  $poseBounds = @()
  for ($pose = 0; $pose -lt 8; $pose++) {
    $column = $pose % 4
    $row = [int][Math]::Floor($pose / 4)
    $left = [int][Math]::Round($column * $source.Width / 4)
    $right = [int][Math]::Round(($column + 1) * $source.Width / 4) - 1
    $top = [int][Math]::Round($row * $source.Height / 2)
    $bottom = [int][Math]::Round(($row + 1) * $source.Height / 2) - 1
    # The frog's long tongue and the mole's drill effects cross a cell edge slightly.
    if ($pose -eq 4 -or $pose -eq 5) { $right = [Math]::Min($source.Width - 1, $right + 55) }
    $minX = $right
    $minY = $bottom
    $maxX = -1
    $maxY = -1
    for ($y = $top; $y -le $bottom; $y += 2) {
      for ($x = $left; $x -le $right; $x += 2) {
        if ($source.GetPixel($x,$y).A -lt 20) { continue }
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
    if ($maxX -lt 0) { throw "Pose $pose is empty in $SourceSheet" }
    $poseBounds += [System.Drawing.Rectangle]::new($minX,$minY,$maxX-$minX+2,$maxY-$minY+2)
  }

  # Keep the idle body readable; large attack effects are fitted per pose below.
  $scale = [Math]::Min(216/$poseBounds[0].Width,216/$poseBounds[0].Height)
  $animations = [ordered]@{
    idle = @(0,0,0,0)
    run = @(1,1,1,1)
    jump = @(2,2,2,2)
    fall = @(3,3,3,3)
    attack = @(0,4,4,0)
    special = @(1,5,5,1)
    up_special = @(2,6,6,2)
    hit = @(0,7,7,0)
  }
  foreach ($name in $animations.Keys) {
    $frameWidth = if ($name -eq 'attack' -or $name -eq 'special') { 384 } else { 256 }
    $sheet = [System.Drawing.Bitmap]::new($frameWidth*4,256,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($sheet)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        for ($frame = 0; $frame -lt 4; $frame++) {
          $pose = $animations[$name][$frame]
          $crop = $poseBounds[$pose]
          $poseScale = [Math]::Min($scale,[Math]::Min(($frameWidth-24)/$crop.Width,220/$crop.Height))
          $width = [int][Math]::Round($crop.Width*$poseScale)
          $height = [int][Math]::Round($crop.Height*$poseScale)
          $bob = if (($name -eq 'run' -or $name -eq 'idle') -and ($frame % 2) -eq 1) { -3 } else { 0 }
          $dest = [System.Drawing.Rectangle]::new($frame*$frameWidth+[int][Math]::Floor(($frameWidth-$width)/2),244-$height+$bob,$width,$height)
          $graphics.DrawImage($source,$dest,$crop,[System.Drawing.GraphicsUnit]::Pixel)
        }
      } finally { $graphics.Dispose() }
      $sheet.Save((Join-Path $spriteDir "$name.png"),[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $sheet.Dispose() }
  }

  if ($NormalAttackSource) {
    $normalCopy = Join-Path $conceptDir 'normal_attack_poses.png'
    if ([System.IO.Path]::GetFullPath($NormalAttackSource) -ne [System.IO.Path]::GetFullPath($normalCopy)) {
      Copy-Item -LiteralPath $NormalAttackSource -Destination $normalCopy -Force
    }
    $normalSource = [System.Drawing.Bitmap]::new($NormalAttackSource)
    $idleFrame = [System.Drawing.Bitmap]::new((Join-Path $spriteDir 'idle.png'))
    try {
      $normalBounds = @()
      for ($pose = 0; $pose -lt 2; $pose++) {
        $left = [int][Math]::Round($pose*$normalSource.Width/2)
        $right = [int][Math]::Round(($pose+1)*$normalSource.Width/2)-1
        $minX = $right
        $minY = $normalSource.Height
        $maxX = -1
        $maxY = -1
        for ($y = 0; $y -lt $normalSource.Height; $y += 2) {
          for ($x = $left; $x -le $right; $x += 2) {
            if ($normalSource.GetPixel($x,$y).A -lt 20) { continue }
            if ($x -lt $minX) { $minX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -gt $maxY) { $maxY = $y }
          }
        }
        if ($maxX -lt 0) { throw "Normal pose $pose is empty in $NormalAttackSource" }
        $normalBounds += [System.Drawing.Rectangle]::new($minX,$minY,$maxX-$minX+2,$maxY-$minY+2)
      }
      $attackSheet = [System.Drawing.Bitmap]::new(1536,256,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try {
        $graphics = [System.Drawing.Graphics]::FromImage($attackSheet)
        try {
          $graphics.Clear([System.Drawing.Color]::Transparent)
          $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          for ($frame = 0; $frame -lt 4; $frame++) {
            if ($frame -eq 0 -or $frame -eq 3) {
              $graphics.DrawImage($idleFrame,[System.Drawing.Rectangle]::new($frame*384+64,0,256,256),[System.Drawing.Rectangle]::new(0,0,256,256),[System.Drawing.GraphicsUnit]::Pixel)
            } else {
              $crop = $normalBounds[$frame-1]
              $scaleNormal = [Math]::Min(344/$crop.Width,188/$crop.Height)
              $width = [int][Math]::Round($crop.Width*$scaleNormal)
              $height = [int][Math]::Round($crop.Height*$scaleNormal)
              $dest = [System.Drawing.Rectangle]::new($frame*384+[int][Math]::Floor((384-$width)/2),244-$height,$width,$height)
              $graphics.DrawImage($normalSource,$dest,$crop,[System.Drawing.GraphicsUnit]::Pixel)
            }
          }
        } finally { $graphics.Dispose() }
        $attackSheet.Save((Join-Path $spriteDir 'attack.png'),[System.Drawing.Imaging.ImageFormat]::Png)
      } finally { $attackSheet.Dispose() }
    } finally { $normalSource.Dispose(); $idleFrame.Dispose() }
  }

  $idle = [System.Drawing.Bitmap]::new((Join-Path $spriteDir 'idle.png'))
  try {
    $select = [System.Drawing.Bitmap]::new(256,256,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($select)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.DrawImage($idle,[System.Drawing.Rectangle]::new(0,0,256,256),[System.Drawing.Rectangle]::new(0,0,256,256),[System.Drawing.GraphicsUnit]::Pixel)
      } finally { $graphics.Dispose() }
      $select.Save((Join-Path $portraitDir 'select.png'),[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $select.Dispose() }

    $hud = [System.Drawing.Bitmap]::new(128,128,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($hud)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($idle,[System.Drawing.Rectangle]::new(0,0,128,128),[System.Drawing.Rectangle]::new(16,0,224,224),[System.Drawing.GraphicsUnit]::Pixel)
      } finally { $graphics.Dispose() }
      $hud.Save((Join-Path $portraitDir 'hud.png'),[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $hud.Dispose() }
  } finally { $idle.Dispose() }
} finally { $source.Dispose() }
