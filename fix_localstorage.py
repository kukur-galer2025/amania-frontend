import os
import glob

# Path to search
app_dir = r"d:\laragon\www\amania-frontend\app"
import_statement = "import { safeStorage } from '@/app/utils/safeStorage';\n"

# Recursive search for ts and tsx files
files = glob.glob(os.path.join(app_dir, "**", "*.ts"), recursive=True)
files.extend(glob.glob(os.path.join(app_dir, "**", "*.tsx"), recursive=True))

for filepath in files:
    # Skip the utility file itself
    if "safeStorage.ts" in filepath:
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    if "localStorage." in content:
        # Avoid double importing
        if "import { safeStorage }" not in content:
            # Check for use client directive
            if content.startswith('"use client";') or content.startswith("'use client';"):
                # Insert after use client
                parts = content.split('\n', 1)
                new_content = parts[0] + '\n' + import_statement + (parts[1] if len(parts) > 1 else '')
            else:
                new_content = import_statement + content
        else:
            new_content = content
            
        new_content = new_content.replace("localStorage.", "safeStorage.")
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {filepath}")
