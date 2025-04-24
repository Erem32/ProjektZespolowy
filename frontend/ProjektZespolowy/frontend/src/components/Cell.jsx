export default function Cell({ value, status, onClick }) {
  const base = {
    border: '1px solid #333',
    aspectRatio: '1/1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    transition: 'transform .1s, background .2s',
  };
  const free = { backgroundColor: '#fff', cursor: 'pointer' };
  const taken = { backgroundColor: '#ccc', cursor: 'default' };

  return (
    <div
      style={{
        ...base,
        ...(status === 'free' ? free : taken),
      }}
      onClick={status === 'free' ? onClick : undefined}
      onMouseEnter={(e) => status === 'free' && (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {value}
    </div>
  );
}
