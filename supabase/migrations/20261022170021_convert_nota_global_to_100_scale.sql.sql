/*
# Convert nota_global from 0-10 scale to 0-100 scale

## Background
The scoring system has been redesigned to use a 1-100 point scale instead of the
previous 1-10 scale. The certificate threshold changes from 8.0/10 to 85/100.

## Changes
1. Multiply all existing `nota_global` values in `empresas` by 10 (8.0 → 80.0, 6.5 → 65.0, etc.)
   so they map correctly to the new 100-point scale.

## Notes
- The `nota_global` column type stays the same (numeric/float).
- All new survey submissions will calculate nota_global directly on the 100-point scale.
- This is a one-time data migration for existing records only.
*/

UPDATE empresas
SET nota_global = nota_global * 10
WHERE nota_global > 0;
