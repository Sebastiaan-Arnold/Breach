# Changelog

All notable changes to Breach. Versions follow `0.<milestone>.<patch>` until the full web
release, which will be `1.0.0`. See [Versioning](README.md#versioning).

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
