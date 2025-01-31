# Specifica la cartella principale
$rootFolder = "d:/UltrastarDeluxe/songs"


# Trova tutte le sottocartelle
$subFolders = Get-ChildItem -Path $rootFolder -Directory

# Itera attraverso ogni sottocartella per verificare la presenza di video.mp4 con dimensioni >= 10k
foreach ($folder in $subFolders) {
    try {
        # Verifica se esiste un file .avi, .mp4 o .ogg con dimensioni >= 10k nella cartella
        $aviFile = Get-ChildItem -Path $folder.FullName -Filter "*.avi" -File | Where-Object { $_.Length -ge 10000 }
        $mp4File = Get-ChildItem -Path $folder.FullName -Filter "*.mp4" -File | Where-Object { $_.Length -ge 10000 }
        $oggFile = Get-ChildItem -Path $folder.FullName -Filter "*.ogg" -File | Where-Object { $_.Length -ge 10000 }
        
        # Verifica se esiste un file usdb.animux.de.txt nella cartella
        $txtFile = Get-ChildItem -Path $folder.FullName -Filter "usdb.animux.de.txt" -File
        
        if (-not $aviFile -and -not $mp4File -and -not $oggFile -and $txtFile) {
            # Verifica se esiste un file video.mp4 con dimensioni >= 10k nella cartella
            $videoFile = Get-ChildItem -Path $folder.FullName -Filter "video.mp4" -File | Where-Object { $_.Length -ge 10000 }
            if (-not $videoFile) {
                # Legge il contenuto del file usdb.animux.de.txt
                $content = Get-Content -Path $txtFile.FullName -Raw

                # Estrai il valore di ID
                if ($content -match "ID:\s*(\d+)") {
                    $id = $matches[1]
                }

                # Estrai i valori di ARTIST e TITLE dalla sezione Metadata
                if ($content -match '"ARTIST":\s*"(.+?)"') {
                    $artist = $matches[1]
                }
                if ($content -match '"TITLE":\s*"(.+?)"') {
                    $title = $matches[1]
                }
                
                # Visualizza i valori separati da una virgola
                Write-Output "$id,$artist,$title"
            }
        }
    }
    catch {
        # Non fare nulla in caso di errore
    }
}
