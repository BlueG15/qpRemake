# Effect text rules

1. Its XML with custom tags
2. </> is used to close the last opened tag
3. {n} where n is an integer inserts text from the array returned from Effect.getDisplayInput() at index n
4. <key> makes the text yellow
5. <attack> makes the text yellow
6. <physical> makes the text yellow
7. <img id = "..."> includes an image or icon with a given ID (all available icons noted down below)
8. <magic> makes the text blue
9. <decompile> makes the text purple 
10. <uadd> or <uminus> encloses a single square bracket, but this bracket is only visisble in catalog mode, uadd's bracket is green while uminus is red

all tags:
{
  'key',
  '/',
  'attack',
  'img id=""effect_manual""/',
  'img id=""player_health""/',
  'decompile',
  'health',
  'magic',
  'img id=""dmg_magic""/',
  'img id=""loot""/',
  'uadd',
  'specialbuff',
  'img id=""effect_init""/',
  'physical',
  'img id=""dmg_phys""/',
  'void',
  'exec',
  'img id=""effect_once""/',
  'cover',
  'img id=""effect_condition""/',
  'img id=""effect_gunique""/',
  'uminus',
  '/key',
  'expose',
  'pathed',
  'align',
  'img id=""effect_consumable""/'
}