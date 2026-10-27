# Breach

A top-down tactical SWAT game set in the fictional harbour city of Port Ardley. You lead a single
operator into buildings you've only seen on a rough briefing map, see only what your operator
sees, and clear every room without getting hit or harming civilians.

The full design lives in [docs/concept.md](docs/concept.md).

## Status: milestone 4

The build has the police academy Range (training), the Officer campaign (five cases from
14 Harbour Lane to the Westquay Lockups) and the Senior Officer campaign (five cases inside
Corvan Logistics), each played from briefing to debrief, with saved progress, stars and
promotions. Enemies get sharper with every rank.

- **Briefing:** a police tablet with the floor plan (unknown areas greyed out), command's marks,
  the case file and intel given as ranges with a reliability rating. Pick one of three entries,
  then deploy. The real situation is rolled from the intel on every deploy.
- **Intro:** each level opens with a short, skippable cutscene of the operator approaching the
  entry while radio lines play.
- **Enemies:** Lookouts, Patrollers and (from Senior Officer) Hiders with an Idle / Alert / Combat state machine. They see in a
  cone with real line of sight, hear your noise, investigate it, path through the house (opening
  doors) and shoot back. Lookouts shout to alert the others.
- **Civilians:** freeze or flee when shooting starts; hold E next to one to secure them.
- **Damage:** body armour absorbs the first hit; two more take the operator down, and you retry
  from the briefing with the situation rolled again.
- **Vision and fog of war:** a 60° raycast vision cone plus a short peripheral radius, blocked by
  walls and door leaves. Three layers: visible, remembered (dim, no live entities) and unknown (black).
- **Laser aim:** the laser shows exactly where a shot lands. It wobbles while you move or turn
  and steadies when you stand still. Heavier guns wobble more and turn more slowly.
- **Doors:** E or right-click opens or closes a door. The leaf is part of line of sight, so the
  room opens up as the door swings. (Kick and peek from the concept are parked for later.)
- **Sound as information:** your own noise shows as a ring of how far it carries. World sounds
  show as vague ripples through walls.
- **Campaign:** progress is saved; the Range promotes you to Officer and opens the Officer
  cases, which unlock in order. Finishing them with enough stars promotes you to Senior Officer
  and issues the SMG. Choose your primary gun on the briefing.
- **Guns with jobs:** from the Senior Officer campaign suspects wear light vests and take two
  hits. The pistol needs a double tap, the SMG lands its second hit fastest, the shotgun stops
  anyone up close in one shot, and rifle rounds count double. A hit that doesn't stop a suspect
  makes them flinch.
- **The Range:** five stations: movement lane, target lane, door station, shoot or don't, and a dark kill
  house whose targets re-roll on every run. Ends with the debrief and stars.
- **Two careers:** the start menu offers a normal career and a realism career, each with its own
  progress. In realism you have one life: going down, or quitting a mission, ends the career and
  resets it to Recruit. A new realism career can skip the academy.
- **Minimal HUD and settings:** ammo, short messages and, on the Range only, tutorial text.
  Esc pauses and opens settings (blood effects, sound) and the controls.

### Controls

| Action | Key |
| --- | --- |
| Move | WASD (or arrows) |
| Sprint (loud) | Shift |
| Aim / fire | Mouse / left click |
| Open or close a door | E (nearest) or right click on it |
| Secure a civilian | Hold E next to them |
| Reload | R |
| Primary gun / pistol | 1 / 2 (on the Range: 1–4 for every issued gun) |
| Skip the intro | Space |
| Pause, settings and controls | Esc |
| Frame-rate readout | F3 |

## Development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for geometry, visibility, pathfinding, levels and intel rolls
npm run build      # type-check and build to dist/
```

### Layout

```
src/
  core/      engine-independent logic: geometry, raycast visibility, level grid, collision,
             pathfinding
  levels/    level data: maps, entries, intel and spawn slots (ASCII maps for now; Tiled later)
  game/      game objects and systems: world, player, enemies, civilians, doors, fog, noise,
             effects, intro, weapons, audio, settings
  scenes/    Phaser scenes: menu, briefing, game and its HUD
tests/       vitest unit tests
```

Levels are ASCII grids of 32 px tiles (legend in `src/core/grid.ts`). The same data drives
collision, line of sight, enemy pathfinding and the briefing map.

## Versioning

Versions follow `0.<milestone>.<patch>` until the full web release (`1.0.0`):

| Version | Milestone |
| --- | --- |
| 0.1.x | Prototype: the Range |
| 0.2.x | Vertical slice: first Officer mission |
| 0.3.x | MVP: Academy plus the Officer campaign |
| 1.0.0 | Full web release |

Every commit is titled `vX.Y.Z: short summary`, bumps `version` in `package.json` in the same
commit and gets an entry in [CHANGELOG.md](CHANGELOG.md). The version is shown on the title card.
Tags are not created by hand: `.github/workflows/tag-version.yml` tags each new version on GitHub
when it lands on `main`.

## Deployment

`.github/workflows/deploy.yml` tests, builds and publishes to GitHub Pages on every push to
`main`, and `.github/workflows/tag-version.yml` tags the new version. One-time setup on GitHub: **Settings → Pages → Source: GitHub Actions**.

## Next

Playtest and tune both campaigns, then the Sergeant campaign (hotel floors, the Heavy enemy
type) and the Lieutenant campaign.
