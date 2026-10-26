# Changelog

All notable changes to Breach. Versions follow `0.<milestone>.<patch>` until the full web
release, which will be `1.0.0`. See [Versioning](README.md#versioning).

## v0.2.3

- Versions are tagged automatically: a workflow creates the `vX.Y.Z` tag on GitHub for the
  version in `package.json` whenever it lands on `main`.

## v0.2.2

- Enemies no longer all walk towards gunfire. Each has a temperament: pushers (most
  patrollers) come for you fast and loud; holders (most lookouts) dig in a few tiles back from
  the door you'd come through, aim at it and wait. Holders notice and react faster while dug in,
  and go back to their spot instead of chasing when they lose sight of you. Levels can fix a
  hostile's temperament; otherwise it's rolled on every deploy.

## v0.2.1

Tuning from the first Harbour Lane playtest.

- Guns are unsuppressed: a shot is heard through the whole building, by enemies and civilians
  alike. Weapons now carry a suppressor flag (shots heard at 30% of the distance, with a muffled
  sound), ready for a later unlock.
- Faster intro: a brisker walk to the entry and tighter radio lines; the longest intro went from
  about 9.5 to 5.5 seconds.
- Clearer entry choice on the briefing: bigger numbered markers with names on the map, the chosen
  route drawn bright, a "Choose entry" list on the right and a Deploy button that names the
  entry.
- Fixed overlapping text in the briefing's intel rows and around the "no plans" area; the
  property boundary is drawn quieter than the building's walls.

## v0.2.0

Milestone 2, vertical slice: the first Officer case, played from briefing to debrief.

- New main menu with level select and settings.
- Briefing screen styled as a police tablet: floor plan with areas the plans don't cover,
  command's marks for last known suspect positions and reported civilians, the case file and
  intel (hostiles as a range, loadout, civilians, reliability). Choose one of three entries.
- The situation inside is rolled from the intel on every deploy: the hostile count stays in
  the briefed range (unverified intel can be off by one), positions vary, the layout doesn't.
- First mission, 14 Harbour Lane: a terraced house with a street, garden and three entries.
- Every level opens with a skippable intro: letterbox bars, the camera pulled back, the operator
  walking to the entry while radio lines play.
- Enemies: Lookouts and Patrollers with an Idle / Alert / Combat state machine, a vision cone
  with line of sight, hearing, pathfinding through the house (opening doors) and return fire.
  Lookouts shout to alert the others; patrollers' footsteps can be heard through walls.
- Civilians freeze or flee when shooting starts and can be secured by holding E. A mission is
  complete once every suspect is down and every civilian is secured.
- Operator damage: armour absorbs the first hit, two more take you down. Retry goes back to the
  briefing with a fresh roll. The HUD shows armour and health, and flashes red on a hit.
- Debrief shows stars, suspects down, civilians secured, accuracy and a case note.
- Floor materials (wood, tile, pavement, grass), plaster interior walls and a police van.
- The flashlight toggle is gone: the weapon light is always on, and dark rooms limit how far
  you see.

## v0.1.4

- Minimal HUD: the magazine as a row of rounds with the spare count beside it, a flashlight
  indicator only in dark rooms, and short unobtrusive messages. The station checklist is gone;
  every mission's objective is simply to secure the area.
- Tutorial text appears only in the tutorial: each Range station shows its card on entry and
  fades it out once it has had time to be read.
- Esc pauses the game and opens a menu with settings (blood effects, sound), restart and the
  controls. Settings are remembered between sessions.
- Blood effects for people: a short spray that stains the floor on a hit and a pool that
  spreads under someone who is down. On by default, toggleable in the menu, and never on the
  Range's cardboard props. They first appear with the enemies in the next milestone.
- Range targets now turn to face the operator when first seen.

## v0.1.3

Look and feel pass on the Range.

- Renders at the size the game is shown on screen (up to 2x) instead of stretching 1280x720,
  so it stays sharp on large and high-density displays.
- Softer fog edges, and vision now fades out towards the edge of its range; the flashlight
  reads as a beam in dark rooms.
- Movement accelerates and decelerates instead of starting and stopping instantly, and aiming
  eases towards the cursor.
- Much less laser sway: half the wobble on every gun, a slower drift, and none at all when
  standing still. Recoil now also knocks the gun back visually.
- More detailed art: wooden plank floors, textured concrete and plywood walls with soft
  contact shadows, door sills and panelled doors, shaded furniture, and figures for the
  operator and the cardboard targets.
- Bullet holes stay in the walls, impacts throw sparks and cardboard chips, spent casings eject
  and skid to a stop, and muzzle flashes briefly light the room.
- F3 shows a frame-rate readout.

## v0.1.2

- Rewrote the design concept (`docs/concept.md`) as a neutral design document and brought it in
  line with current decisions.
- Added this changelog and a versioning convention.
- The build version is now shown on the title card.

## v0.1.1

- Narrowed the vision cone from 100° to 60°.
- Reduced recoil per shot by roughly 60% on every gun.
- Doors now have a single open/close action (E or right click). The door menu with open slowly,
  kick and peek is parked for a later version; the door station asks you to clear three booths.

## v0.1.0

Milestone 1: the Range prototype.

- Phaser 3 + TypeScript + Vite project, deployed to GitHub Pages.
- Raycast vision cone with fog of war: visible, remembered and unknown.
- Laser aim with wobble that steadies when standing still; four guns with distinct handling.
- Doors whose leaves block line of sight, cardboard targets and sound ripples through walls.
- Five training stations (movement lane, target lane, door station, shoot or don't, dark kill
  house with randomised targets) and a debrief with stars.
- Unit tests for geometry, visibility, level parsing and collision.
