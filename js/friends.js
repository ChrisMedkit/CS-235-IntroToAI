// Friends wall data for social/friends.html. One line per friend; js/friends-page.js draws it.
//
//   name    how they show up (required)
//   url     their site, starting with https:// (required)
//   button  their 88x31 button: save it in images/buttons/ and give the path from the site root,
//           e.g. "images/buttons/sam.gif" (ask first, and don't hotlink their copy). Leave it out
//           and they get a text link instead.
//   note    a few words about them or their site (optional)

/** @type {{name: string, url: string, button?: string, note?: string}[]} */
export const FRIENDS = [
  // { name: "Sam", url: "https://sam.neocities.org", button: "images/buttons/sam.gif", note: "pixel art + frogs" },
];

/** Sites that inspired Christopia (from the redesign brief). Delete any you'd rather not link. */
export const NEIGHBORS = [
  { name: "Mental Labour", url: "https://mental-labour.neocities.org/", note: "a pixel-art splash you walk through" },
  { name: "Knoxstation", url: "https://knoxstation.neocities.org/", note: "a packed portal of art, shrines and widgets" },
  { name: "Simone's Computer", url: "https://simone.computer/#/webdesktops", note: "a directory of web desktops" },
  { name: "caramelfevers", url: "https://caramelfevers.neocities.org/", note: "a home page set out like a table of things" },
];
