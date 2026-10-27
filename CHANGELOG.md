# Changelog

All notable changes to Breach. Versions follow `0.<milestone>.<patch>` until the full web
release, which will be `1.0.0`. See [Versioning](README.md#versioning).

## v0.5.0

Presentation, part one: menus.

- New title screen: a live backdrop (a level's plan drifting under a sweeping, wall-occluded
  light), a reworked logo, and career cards with rank insignia and progress.
- New campaign screen: campaign cards with star progress, and the selected campaign's story,
  promotion progress and cases with location and time.
- Every menu works from the keyboard (arrows, Enter, Escape) as well as the mouse, with hover
  and focus states and their own sounds. Screens fade between each other.
- Settings panel (title screen and pause menu): volume, blood, screen shake and fullscreen.
- Reworked pause menu and debrief: stars stamp in one by one, then the numbers and case note.
- A low ambient bed plays under the menus.
- Fonts: Barlow Condensed and JetBrains Mono, bundled with the game (SIL Open Font License).

## v0.4.14

Older levels get the new terrain, so fewer of them read as plain boxes:

- Harbour Freight Office stands on Pier Seven: harbour water on three sides and timber quays.
- Cold Store sits on the Westquay dock, with water and a quay along the north and east.
- Westquay Lockups has a canal and towpath along the north edge.
- Corvan Head Office has glass partitions along the open-plan floor and glass office fronts, so
  you can see (and be seen) across the corridor.
- Grand Atlas Conference Suite has a glass-fronted boardroom.
- Kestrel Road has windows onto the back garden (the hostage room among them) and a pond.
- Grand Atlas Penthouse has floor-to-ceiling glass onto the terrace and a pool.

Layouts, entries, spawn points and patrols are unchanged.

## v0.4.13

Ardley Lodge, from playtesting:

- Kitchen Garden entry: the grounds patrol no longer walks past the kitchen door, and the
  kitchen guard no longer stands facing it. Spawning there (or at the other entries) no longer
  gets you seen straight away.
- Only real trouble sends a guard to the alarm: seeing you, or hearing a shot, a shout or
  breaking glass. Footsteps and doors only make a guard curious. He walks briskly rather than
  sprints, and needs 3 s at the panel instead of 1.5 s, with an ALARM countdown at the top of
  the screen.
- Suppressors are stronger: a suppressed shot is heard about half as far as before.

## v0.4.12

- Ardley Lodge reworked, from playtesting: being seen or heard no longer fails the mission on
  the spot. The house has two alarm panels, marked ALARM on the plan. Alerted guards push or
  dig in as usual, and the alerted guard nearest a panel runs for it ("A guard is running for
  the alarm"). Drop him before he has set it off and the mission goes on; the next alerted
  guard takes up the run. Reaching a panel and staying 1.5 s raises the alarm and fails it.

## v0.4.11

- Glass breaks: any shot through a window shatters it, with a crash every suspect in earshot
  hears (suppressed or not) and shards left on the floor. A broken pane is an opening you can
  walk through. Enemy shots break glass too.
- Glass corners close: panes are drawn as joined-up lines with a frame, so corners and
  junctions with walls and doors no longer leave gaps. Panes are a little thicker and brighter.

## v0.4.10

The Lieutenant campaign, "The top", and more varied places.

- Five new cases following Voight's contacts: Hillcrest Villa (an L-shaped glass villa round a
  pool), The Halcyon (a yacht at its berth), Ardley Lodge (a country house round a cloistered
  courtyard), Gull Point (a round lighthouse on a rocky point) and Westcliff House (a clifftop
  villa with a glass room over the sea). Finishing it promotes you to Captain.
- New terrain: water (blocks movement, not sight or bullets), glass walls and windows (the
  same), and outdoor timber decking. Low walls and rails outdoors are drawn as stone and join
  up into one line.
- New twist, Silent (Ardley Lodge): the mission fails the moment the alarm goes up.
- The alarm now needs a suspect in earshot: a suppressed shot in an empty wing goes unheard.
- A mission that is already lost (out of time, escaped, compromised) stays lost even if the
  operator is hit in the moments after, so it never ends a realism career.

## v0.4.9

From playtesting v0.4.8.

- Rear Yard is harder: six or seven suspects instead of four or five, and they run for the car
  faster. With a five-round magazine, expect to reload mid-fight. The extra suspects start
  further from the car, so the pressure builds rather than arriving all at once.
- Fixed: a long gun description (the assault rifle's) could overlap the sidearm line in the
  briefing. The loadout now reserves room for the longest description of the guns on offer,
  measured on screen, and the overlap check runs with every gun selected.

## v0.4.8

The Sergeant campaign, "Clean money": one night at the Grand Atlas Hotel, following Meridian
Partners from the service level to the penthouse.

- Five new cases: Service Level, Floor 4, Conference Suite, Rear Yard and Penthouse.
- New enemy, the Heavy: a contractor in a plate carrier with a rifle. One more hit to stop than
  everyone else at that rank, always pushes towards a fight, fires a little faster.
- Rear Yard is the campaign's specialty case: rooftop overwatch with the sniper rifle issued.
  The camera pulls right out over the whole yard. When the alarm goes up, every suspect makes
  for the getaway car; one reaching it fails the mission. The briefing marks the car.
- Promotion out of the campaign makes you Lieutenant and issues suppressors.

## v0.4.7

A rewrite of the briefing and the game's text, for a more realistic, procedural tone.

- Briefing: a fixed structure of situation (short bullets), objective (one line), intel, loadout
  and entry point. The header shows the campaign and case number (derived, so it never goes out
  of date), the address, the time of the operation and the unit.
- Intel rows read Suspects, Weapons, Civilians and Intel, in short form ("4–6, light vests").
- Every case file, radio call, debrief note and promotion note is rewritten: names, times and
  counts, callsigns on the radio, no flourishes. In-game messages follow suit ("Compromised.
  30 s to reach the hostage.", "Area secure").
- Tollgate Flats lists the power cut as its twist. Map labels have a dark backing so they read
  over walls.

## v0.4.6

The runner is out; three simpler twists are in, all started by the same moment: the alarm (a
suspect sees you, or a shot or shout).

- Fenwick Terrace is now a house party: armed men among six to eight guests who freeze or
  scatter. Check every target and secure everyone.
- Kestrel Road: one of the homeowners is held in a back bedroom. Once the alarm goes up, a
  30-second clock runs at the top of the screen. Secure the hostage in time or the mission
  fails (a realism career goes on).
- Corvan Head Office: when the alarm goes up, the nearest suspect runs for the shredder in the
  manager's office. Stop him within eight seconds of him getting there, or the files are gone
  and so is the first star.
- Briefing: a case's twist is one yellow line at the top of the intel, with a yellow label on
  the plan (HOSTAGE, EVIDENCE). At most three civilians are marked, so the party doesn't bury
  the plan. Entry labels at the edge of the map sit under their marker instead of running off
  the tablet. Every briefing was checked for overlapping text.

## v0.4.5

From playtesting v0.4.4: the overwatch case is out, and Street Crime gets a specialty case.

- New Officer case 2, Fenwick Terrace: the crew's runner, Kyle Marsh, bolts for the end of the
  street or the back alley the moment he sees you or hears trouble. He's unarmed: catch him by
  running him down. Shooting him costs a star, and if he gets away the mission fails (even a
  realism career goes on). The briefing marks the ways out. Promotion out of Street Crime now
  takes 12 stars.
- Pier Six is removed. Overwatch returns as a rooftop mission in the Sergeant campaign.
  Supply Chain is back to six cases (12 stars for promotion).
- The sniper scope pulls the camera further out and shows a wider strip.

## v0.4.4

A new gun line-up, two specialty cases and suppressors.

- Guns: the SMG is retired. Promotions now issue the shotgun (Officer), the assault rifle (Senior
  Officer) and a new sniper rifle (Sergeant). Suppressors are the last issue, at Lieutenant.
- Sniper rifle: bolt action, five rounds, one hit stops anyone. Hold Space to look down the scope:
  the operator braces, vision reaches far down the aim and the camera pushes out along it.
- Suppressors fit the pistol, assault rifle and sniper rifle. A suppressed shot is heard about a
  third as far. Toggle them on the briefing once issued.
- Supply Chain has seven cases. New: Salter Street, a close-quarters lodging house made for the
  shotgun, and Pier Six, an overwatch mission that issues the sniper rifle for the job. Promotion
  out of Supply Chain now takes 14 stars.
- The briefing remembers your last gun and fits the loadout on one line.
- Fixed: the middle of stacked containers outdoors showed as an unlit black square.

## v0.4.3

Every gun now has a job.

- From the Senior Officer campaign on, suspects wear light vests (a grey chest plate) and take two
  hits to stop. Officer-campaign suspects still go down to one. The briefing says when suspects
  are vested.
- Damage per gun: the pistol and SMG do one hit per shot, so the SMG's fire rate gives the
  fastest double tap. The shotgun does one hit per pellet and stops anyone up close in one shot.
  Rifle rounds count double.
- A hit that doesn't stop a suspect makes them flinch: their aim is thrown off for a moment and
  they turn towards the shooter.
- The briefing describes the chosen gun under the loadout.

## v0.4.2

Fixes and changes from a playthrough of both campaigns.

- Start menu: choose a normal or a realism career, then see its campaigns. Each career has its
  own progress, so switching between them never deletes anything. Existing saves move into the
  normal (or realism) career automatically.
- A new realism career can skip the academy and start as an Officer.
- Tall objects block sight and bullets, not just movement: warehouse racking, lorries,
  containers and vans. Low furniture and cars are still cover you can see and shoot over.
- Intros are safe: enemies can't spot the operator during the cutscene, and the Ferry Road and
  Westquay gate entries now end beside the gate behind the fence instead of in the open yard.

## v0.4.1

- Realism mode: an optional career with one life. Going down ends the career and progress resets
  to Recruit, with a "Career over" debrief showing the rank and stars it reached.
- Switching realism on from the menu starts a new career (it asks for a second click); switching
  it off keeps your progress.
- In a realism mission the pause menu has no restart, and quitting asks for confirmation because
  it ends the career. Closing the game mid-mission counts as going down: the next time the game
  loads, the career ends and the menu says so.

## v0.4.0

Milestone 4: the Senior Officer campaign.

- Difficulty rises with rank. Each campaign has a difficulty profile: from Senior Officer on,
  enemies react faster, notice you sooner, aim tighter and fire more often. Officer stays as it
  was; Sergeant and Lieutenant profiles are ready for their campaigns.
- New enemy: the Hider. It waits behind cover with a shotgun, tracks you silently at range and
  only opens fire once you're within about five tiles. It never leaves its spot.
- The Supply Chain campaign, five cases following Corvan Logistics:
  1. Corvan Depot: racking aisles with Hiders waiting among the shelves.
  2. Corvan Head Office: an open-plan office with staff working late among the hostiles.
  3. Cold Store: a dark refrigerated warehouse with shotguns between the racks.
  4. Ferry Road: a truck yard with patrols between the lorries, on unverified intel.
  5. Harbour Freight Office: the Harbourmaster's own office, on confirmed intel.
- Promotion to Sergeant (all five cases and 10 of 15 stars) issues the shotgun.
- New set dressing: warehouse racking and lorries. Props can have custom sizes.
- The menu lists campaigns on the left and the chosen campaign's cases on the right, so it
  scales to every rank.

## v0.3.3

- The exterior is always lit: streets, gardens, yards and the outside of buildings are never
  fogged. People outside still only show up when you can see them.
- Parked vans, cars and containers are solid for everyone, and the intro walks route around
  the van instead of over it. A new test checks every intro route stays clear of walls, doors
  and props.
- The tagging workflow no longer stops at a tag GitHub refuses; it reports it as a warning and
  carries on with the rest.

## v0.3.2

- The tagging workflow now tags every version in a push, not just the newest, so pushing several
  versions at once still tags each of them.

## v0.3.1

The full Officer campaign: five cases, each introducing one new idea, with a story thread that
runs from street-level dealing to the supplier behind it.

- Case 2, Tollgate Flats: a ground-floor flat with the power cut. The whole flat is dark, so
  you only see as far as your weapon light reaches. Enter by the lit stairwell or the garden.
- Case 3, Mercer Street Garage: an open workshop with cars for cover, long sight lines and two
  patrols, plus an office, a dark storeroom and toilets the plans don't show.
- Case 4, Kestrel Road: a family home the crew has taken over. Two or three homeowners inside,
  close to the suspects, and unverified intel: the count and the marks may be off.
- Case 5, Westquay Lockups: the finale in a fenced lockup yard. Open ground with containers,
  rows of lockup doors and a site office; four or five hostiles on unverified intel.
- Promotion to Senior Officer now needs all five cases and at least 10 of 15 stars.
- New floor materials and set dressing: indoor concrete (lit and dark), cars and containers.
- An entry's intro can start from its own drop-off point, so far-side entries don't need a long
  walk round.

## v0.3.0

Milestone 3 begins: the campaign framework.

- Progress is saved in the browser: rank, best stars per level and completed levels.
- Ranks and promotion: passing the Range promotes a Recruit to Officer and opens the Officer
  campaign; finishing every case with enough stars promotes to Senior Officer and issues the SMG.
  Each promotion shows a note from the captain.
- The menu shows your rank and each campaign with its cases, best stars, locks and stars needed
  for promotion. Progress can be reset from the menu.
- Loadout: the briefing lets you choose a primary gun from those issued; the pistol is always
  carried as a sidearm. In missions, 1 selects the primary and 2 the pistol. On the Range, 1-4
  cycle through every gun you've been issued.

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
