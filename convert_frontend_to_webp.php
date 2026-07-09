<?php
// convert_frontend_to_webp.php
$publicDir = __DIR__ . '/public';
$appDir = __DIR__ . '/app';

echo "=== Memulai Konversi WebP untuk Frontend ===\n";

$convertedFiles = [];

function convertToWebp($filePath) {
    global $convertedFiles;
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    
    if (!in_array($ext, ['png', 'jpg', 'jpeg'])) return false;
    
    $newPath = preg_replace('/\.(png|jpg|jpeg)$/i', '.webp', $filePath);
    
    $image = null;
    if ($ext === 'png') {
        $image = @imagecreatefrompng($filePath);
        if ($image) {
            imagepalettetotruecolor($image);
            imagealphablending($image, true);
            imagesavealpha($image, true);
        }
    } else {
        $image = @imagecreatefromjpeg($filePath);
    }
    
    if (!$image) return false;
    
    $success = imagewebp($image, $newPath, 80);
    imagedestroy($image);
    
    if ($success) {
        unlink($filePath);
        $oldName = basename($filePath);
        $newName = basename($newPath);
        $convertedFiles[$oldName] = $newName;
        echo "Converted: $oldName -> $newName\n";
        return true;
    }
    return false;
}

// 1. Convert all images in public/
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($publicDir));
foreach ($iterator as $file) {
    if ($file->isFile()) {
        convertToWebp($file->getPathname());
    }
}

// 2. Search and replace all references in app/
function replaceReferences($dir) {
    global $convertedFiles;
    
    if (empty($convertedFiles)) {
        echo "Tidak ada gambar yang dikonversi.\n";
        return;
    }

    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $ext = strtolower(pathinfo($file->getPathname(), PATHINFO_EXTENSION));
            if (in_array($ext, ['tsx', 'ts', 'css', 'js', 'jsx'])) {
                $content = file_get_contents($file->getPathname());
                $newContent = $content;
                
                // Only replace exactly the filenames that we just converted
                foreach ($convertedFiles as $oldName => $newName) {
                    // Replace /filename.png with /filename.webp
                    // or filename.png with filename.webp
                    $newContent = str_replace($oldName, $newName, $newContent);
                }
                
                if ($newContent !== $content) {
                    file_put_contents($file->getPathname(), $newContent);
                    echo "Updated references in: " . $file->getFilename() . "\n";
                }
            }
        }
    }
}

replaceReferences($appDir);

echo "=== Selesai ===\n";
