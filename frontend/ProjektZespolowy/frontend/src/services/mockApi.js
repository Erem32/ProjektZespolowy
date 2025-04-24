export const fetchRooms = () =>
  Promise.resolve([
    { id: '1', name: 'Pokój A', players: 3 },
    { id: '2', name: 'Pokój B', players: 5 },
    { id: '3', name: 'Pokój C', players: 2 },
  ]);
