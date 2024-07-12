#!/bin/bash

# Navigate to the directory containing the files
cd municities/lowres

# Counter variable
counter=1

# Iterate over each file in the directory
for file in *; do
    # Check if it's a regular file
    if [ -f "$file" ]; then
        # Generate new filename
        new_name="cities-province_$counter.json"
        
        # Rename the file
        mv "$file" "$new_name"
        
        # Increment counter
        ((counter++))
    fi
done
