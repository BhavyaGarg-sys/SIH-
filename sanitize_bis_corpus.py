import os

import re

import sys

import logging

from pathlib import Path



# Configure structured logging

logging.basicConfig(

    level=logging.INFO,

    format="%(asctime)s [%(levelname)s] %(message)s",

    handlers=[

        logging.StreamHandler(sys.stdout)

    ]

)



# Fraction translation map

UNICODE_FRACTIONS = {

    '½': '1/2',

    '¼': '1/4',

    '¾': '3/4',

    '⅓': '1/3',

    '⅔': '2/3',

    '⅛': '1/8',

    '⅜': '3/8',

    '⅝': '5/8',

    '⅞': '7/8'

}



# Regex patterns for terminal noise truncation

TRUNCATION_PATTERNS = [

    re.compile(r'\n\s*(?:ANNEX\s+[A-Z]\s+)?COMMITTEE\s+COMPOSITION', re.IGNORECASE),

    re.compile(r'\n\s*COMPOSITION\s+OF\s+(?:THE\s+)?(?:SECTIONAL\s+)?COMMITTEE', re.IGNORECASE),

    re.compile(r'\n\s*Sectional\s+Committee\s*,\s*[A-Z]{3,4}\b', re.IGNORECASE),

    re.compile(r'\n\s*BUREAU\s+OF\s+INDIAN\s+STANDARDS\s*\n\s*Headquarters\s*:', re.IGNORECASE),

    re.compile(r'\n\s*Regional\s+Offices\s*:\s*\n', re.IGNORECASE),

    re.compile(r'\n\s*Branch\s+Offices\s*:\s*\n', re.IGNORECASE)

]





def extract_standard_id(filename: str) -> str:

    """

    Extracts and standardizes the BIS identifier from a filename.

    e.g., 'IS_269.txt' -> 'IS 269', 'IS_1239_Part_1.txt' -> 'IS 1239 Part 1'

    """

    stem = Path(filename).stem

    clean_stem = re.sub(r'[_]+', ' ', stem).strip()

    match = re.search(r'\bIS\s*\d+(?:\s*(?:Part|Pt)\s*\d+)?(?:\s*\d{4})?\b', clean_stem, re.IGNORECASE)

    if match:

        standard_id = re.sub(r'\s+', ' ', match.group(0).upper())

        if not standard_id.startswith("IS "):

            standard_id = standard_id.replace("IS", "IS ")

        return standard_id

    return clean_stem.upper()





def normalize_ocr_symbols(text: str) -> str:

    """

    Normalizes corrupt OCR tokens, tolerance marks, units, and unicode fractions.

    """

    # 1. Unicode fraction replacement

    for frac, replacement in UNICODE_FRACTIONS.items():

        text = text.replace(frac, replacement)



    # 2. Corrupt tolerance symbols: 'ą' or '?' between numbers or before numbers

    text = re.sub(r'(?<=\d)\s*(?:ą|\?)\s*(?=\d)', ' ± ', text)

    text = re.sub(r'\bą\b', '±', text)

    text = re.sub(r'(?<=\s)\?\s*(?=\d+(?:\.\d+)?\s*(?:mm|cm|m|kg|g|%|°C|MPa|kN|V|A|W))', '± ', text)



    # 3. Corrupted concentration and engineering units (e.g., pg/ml -> µg/ml in chemical contexts)

    text = re.sub(r'\b(\d+(?:\.\d+)?)\s*pg/ml\b', r'\1 µg/ml', text, flags=re.IGNORECASE)

    text = re.sub(r'\b(\d+(?:\.\d+)?)\s*ug/ml\b', r'\1 µg/ml', text, flags=re.IGNORECASE)

    text = re.sub(r'\b(\d+(?:\.\d+)?)\s*u(?=m\b|F\b|s\b|g\b)', r'\1 µ', text)



    # 4. Temperature degree symbols (e.g., '° C', 'º C', '°C')

    text = re.sub(r'[º°]\s*C\b', '°C', text)



    return text





def truncate_document_noise(text: str) -> str:

    """

    Truncates administrative appendices (committee memberships, BIS sales offices, phone directories).

    """

    earliest_cutoff = len(text)

    

    for pattern in TRUNCATION_PATTERNS:

        match = pattern.search(text)

        if match and match.start() < earliest_cutoff:

            earliest_cutoff = match.start()

            

    return text[:earliest_cutoff]





def sanitize_characters(text: str) -> str:

    """

    Strips non-printable control characters while retaining valid mathematical and structural symbols.

    """

    # Replace orphan form-feeds with standard newlines

    text = text.replace('\x0c', '\n')



    # Remove non-printable control characters (\x00-\x08, \x0b, \x0e-\x1f, \x7f-\x9f)

    # Retains \t (\x09), \n (\x0a), and printable unicode (±, µ, °, etc.)

    text = re.sub(r'[\x00-\x08\x0B\x0E-\x1F\x7F-\x9F]', '', text)



    # Clean header/footer artifacts matching OCR scan markers

    text = re.sub(r'^[_\-\s=]{4,}$', '', text, flags=re.MULTILINE)



    # Normalize horizontal whitespace (convert non-breaking spaces, collapse runs of tabs/spaces)

    text = text.replace('\u00A0', ' ')

    text = re.sub(r'[^\S\r\n]+', ' ', text)



    # Strip trailing whitespace on individual lines

    text = re.sub(r'[ \t]+$', '', text, flags=re.MULTILINE)



    # Collapse excessive blank lines to a maximum of 2 newlines

    text = re.sub(r'\n{3,}', '\n\n', text)



    return text.strip()





def process_file(source_path: Path, target_path: Path) -> bool:

    """

    Reads, cleans, and saves a single BIS text standard.

    """

    try:

        with open(source_path, 'r', encoding='utf-8', errors='ignore') as f:

            raw_text = f.read()



        if not raw_text.strip():

            logging.warning(f"Empty source file skipped: {source_path.name}")

            return False



        # Cleaning stages

        standard_id = extract_standard_id(source_path.name)

        cleaned = normalize_ocr_symbols(raw_text)

        cleaned = truncate_document_noise(cleaned)

        cleaned = sanitize_characters(cleaned)



        # Inject standard metadata header

        final_text = f"[METADATA: STANDARD_ID = {standard_id}]\n\n{cleaned}\n"



        target_path.parent.mkdir(parents=True, exist_ok=True)

        with open(target_path, 'w', encoding='utf-8', errors='replace') as f:

            f.write(final_text)



        logging.info(f"Processed [{standard_id}] -> {target_path.relative_to(target_path.parents[2])}")

        return True



    except Exception as e:

        logging.error(f"Failed processing {source_path.name}: {str(e)}")

        return False





def run_pipeline(input_dir: str = "./data/raw", output_dir: str = "./data/cleaned"):

    """

    Traverses input directory, processes all .txt documents, and outputs to cleaned directory.

    """

    src_root = Path(input_dir)

    dest_root = Path(output_dir)



    if not src_root.exists():

        logging.error(f"Input directory does not exist: {src_root.resolve()}")

        sys.exit(1)



    txt_files = list(src_root.rglob("*.txt"))

    if not txt_files:

        logging.warning(f"No .txt files found under {src_root.resolve()}")

        return



    logging.info(f"Discovered {len(txt_files)} text files. Starting cleaning pipeline...")

    

    success_count = 0

    for txt_file in txt_files:

        relative_path = txt_file.relative_to(src_root)

        dest_file = dest_root / relative_path

        if process_file(txt_file, dest_file):

            success_count += 1



    logging.info(f"Corpus sanitization completed: {success_count}/{len(txt_files)} files written to {dest_root.resolve()}")





if __name__ == "__main__":

    import argparse

    parser = argparse.ArgumentParser(description="Clean and sanitize raw BIS standard text files.")

    parser.add_argument("--input", "-i", default="./data/raw", help="Path to raw dataset directory (default: ./data/raw)")

    parser.add_argument("--output", "-o", default="./data/cleaned", help="Path to output cleaned directory (default: ./data/cleaned)")

    

    args = parser.parse_args()

    run_pipeline(input_dir=args.input, output_dir=args.output)
