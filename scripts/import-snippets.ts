import { db } from "../db/index";
import { snippets } from "../db/schema";
import { readFileSync } from "fs";
import { join } from "path";

// Parse CSV content (handles multi-line fields and escaped quotes)
function parseCSV(csvContent: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const lines = csvContent.split('\n');
  
  if (lines.length < 2) return [];
  
  // Parse header
  const headerLine = lines[0];
  const headers: string[] = [];
  let currentHeader = "";
  let inQuotes = false;
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    const nextChar = headerLine[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentHeader += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      headers.push(currentHeader.trim());
      currentHeader = "";
    } else {
      currentHeader += char;
    }
  }
  headers.push(currentHeader.trim());
  
  // Parse data rows (handle multi-line fields)
  let currentRow: string[] = [];
  let currentField = "";
  let rowInQuotes = false;
  let i = 1;
  
  while (i < lines.length) {
    const line = lines[i];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];
      
      if (char === '"') {
        if (rowInQuotes && nextChar === '"') {
          currentField += '"';
          j++;
        } else {
          rowInQuotes = !rowInQuotes;
        }
      } else if (char === ',' && !rowInQuotes) {
        // Unescape the field
        let fieldValue = currentField.trim();
        if (fieldValue.startsWith('"') && fieldValue.endsWith('"')) {
          fieldValue = fieldValue.slice(1, -1);
        }
        fieldValue = fieldValue.replace(/""/g, '"');
        currentRow.push(fieldValue);
        currentField = "";
      } else {
        currentField += char;
      }
    }
    
    // If we're not in quotes, we've finished a row
    if (!rowInQuotes) {
      // Add last field
      let fieldValue = currentField.trim();
      if (fieldValue.startsWith('"') && fieldValue.endsWith('"')) {
        fieldValue = fieldValue.slice(1, -1);
      }
      fieldValue = fieldValue.replace(/""/g, '"');
      currentRow.push(fieldValue);
      
      if (currentRow.length === headers.length) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = currentRow[index] || "";
        });
        rows.push(row);
      }
      
      currentRow = [];
      currentField = "";
    } else {
      // Multi-line field, add newline
      currentField += '\n';
    }
    
    i++;
  }
  
  return rows;
}

async function importSnippets() {
  try {
    console.log("Reading CSV file...");
    const csvPath = join(process.cwd(), "client/src/components/snippets/snippets.csv");
    const csvContent = readFileSync(csvPath, "utf-8");
    
    console.log("Parsing CSV...");
    const rows = parseCSV(csvContent);
    console.log(`Found ${rows.length} snippets to import`);
    
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. Please configure it in your environment variables.");
    }
    
    console.log("Inserting snippets into database...");
    
    for (const row of rows) {
      try {
        // Parse dates
        const createdAt = row.created_at ? new Date(row.created_at) : new Date();
        const updatedAt = row.updated_at ? new Date(row.updated_at) : new Date();
        
        // Insert snippet (don't use the id from CSV, let database generate it)
        const [snippet] = await db
          .insert(snippets)
          .values({
            title: row.title,
            description: row.description || null,
            code: row.code,
            language: row.language,
            createdAt,
            updatedAt,
          })
          .returning();
        
        console.log(`✓ Imported: ${snippet.title}`);
      } catch (error) {
        console.error(`✗ Failed to import "${row.title}":`, error);
      }
    }
    
    console.log("\nImport completed!");
  } catch (error) {
    console.error("Error importing snippets:", error);
    process.exit(1);
  }
}

// Run the import
importSnippets();

