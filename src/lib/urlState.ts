import { parseAsArrayOf, parseAsString } from 'nuqs'

export const urlStateParsers = {
  areas: parseAsArrayOf(parseAsString, ',').withDefault([]),
  example: parseAsString,
  column: parseAsString,
}
