# Changelog

All notable changes to Breach. Versions follow `0.<milestone>.<patch>` until the full web
release, which will be `1.0.0`. See [Versioning](README.md#versioning).

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
