# Breach

A top-down tactical game set in the fictional harbour city of Port Ardley. You lead a single
operator into buildings you've only seen on a rough briefing plan, see only what your operator
sees, and clear every room without getting hit or harming civilians.

**Play it in the browser:** https://sebastiaan-arnold.github.io/Breach/ (mouse and keyboard).

The full design lives in [docs/concept.md](docs/concept.md).

## The game

Five campaigns, one per rank, each a thread of the same story: a street-level dealing crew, the
logistics firm behind it, the accountants cleaning its money, and the people at the top.

| Rank | Campaign | Cases |
| --- | --- | --- |
| Recruit | Academy | The Range: movement, aim, doors, shoot or don't, a dark kill house |
| Officer | Street crime | Six raids on the Ashby estate, from 14 Harbour Lane to the Westquay Lockups |
| Senior Officer | Supply chain | Six cases inside Corvan Logistics, from the depot to Pier Seven |
| Sergeant | Clean money | One night at the Grand Atlas Hotel, from the service level to the penthouse |
| Lieutenant | The top | A glass villa, a moored yacht, a country house, a lighthouse and a clifftop house |

- **Briefing:** a police tablet with the floor plan (unknown areas greyed out) and command's
  marks beside a structured case: situation, objective, intel (given as ranges with a
  reliability rating), loadout and entry point. Deploy, and the real situation is rolled from
  the intel, so no two runs are the same.
- **Vision and fog of war:** a raycast vision cone blocked by walls and door leaves. What you
  saw stays dim on the map; who is there now, you only know while you can see them.
- **Laser aim:** the laser shows exactly where a shot lands. It wobbles while you move or turn
  and steadies when you stand still.
- **Sound:** your own noise shows as a ring of how far it carries; enemies hear it, investigate
  and come looking. Gunfire carries through a building, suppressed shots a few rooms.
- **Enemies:** lookouts, patrollers, hiders with shotguns and heavies in plate carriers. Some
  push towards a fight, others dig in and cover the door you'll come through. They get sharper
  with every rank, and from Senior Officer they wear vests.
- **Guns with jobs:** a pistol, then a shotgun, an assault rifle and a bolt-action sniper rifle
  with a scope, issued as you're promoted; suppressors come last.
- **Specialty cases:** a house party, a hostage on the clock, files that get shredded, close
  quarters, rooftop overwatch and a silent infiltration with alarm panels.
- **Places:** houses, warehouses, offices and docks, then hotel floors, a yacht, a lighthouse;
  water you can see across, glass that shatters, timber decks.
- **Careers:** a normal career, or a realism career with one life, each with its own progress.

## Controls

| Action | Key |
| --- | --- |
| Move | WASD (or arrows) |
| Sprint (loud) | Shift |
| Aim / fire | Mouse / left click |
| Open or close a door | E (nearest) or right click on it |
| Secure a civilian | Hold E next to them |
| Reload | R |
| Primary gun / pistol | 1 / 2 (on the Range: 1–4 for every issued gun) |
| Sniper scope | Hold Space |
| Skip the intro | Space |
| Pause, settings and controls | Esc |
| Frame-rate readout | F3 |

Menus work with the mouse or the keyboard (arrows, Enter, Escape). Settings: volume, blood,
screen shake and fullscreen.

## Development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests: geometry, visibility, pathfinding, level data, intel rolls, progress
npm run build      # type-check and build to dist/
```

### Layout

```
src/
  core/      engine-independent logic: geometry, raycast visibility, level grid, collision,
             pathfinding
  levels/    campaigns and level data (maps, entries, intel, spawn slots), one folder per
             campaign
  game/      game objects and systems: world, player, enemies, civilians, doors, glass, fog,
             noise, effects, intro, weapons, audio, settings, progress
  scenes/    Phaser scenes: title, campaign menu, briefing, game, HUD, promotion; the UI kit
tests/       vitest unit tests, one file per area
public/      icon and share image
```

Levels are ASCII grids of 32 px tiles (legend in `src/core/grid.ts`). The same data drives
collision, line of sight, enemy pathfinding and the briefing map. Every sound is synthesised in
the browser with the Web Audio API; there are no audio files.

## Credits

Built with [Phaser 3](https://phaser.io), TypeScript and Vite. Fonts: Barlow Condensed and
JetBrains Mono, both under the SIL Open Font License, bundled through Fontsource. Port Ardley,
its people and its cases are fictional.

## License

[MIT](LICENSE). The bundled fonts are under the SIL Open Font License.

## Versioning

| Version | Milestone |
| --- | --- |
| 0.1.x | Prototype: the Range |
| 0.2.x | Vertical slice: first Officer mission |
| 0.3.x | MVP: Academy plus the Officer campaign |
| 0.4.x | All five campaigns |
| 0.5–0.7 | Presentation: menus, game feel, briefing and promotion |
| 1.0.0 | Full web release |

Every commit is titled `vX.Y.Z: short summary`, bumps `version` in `package.json` in the same
commit and gets an entry in [CHANGELOG.md](CHANGELOG.md). The version is shown on the title
screen. Tags are not created by hand: `.github/workflows/tag-version.yml` tags each new version
on GitHub when it lands on `main`.

## Deployment

`.github/workflows/deploy.yml` tests, builds and publishes to GitHub Pages on every push to
`main`. One-time setup on GitHub: **Settings → Pages → Source: GitHub Actions**.
