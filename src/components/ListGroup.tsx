function ListGroup() {
  let items = ["New York", "San Francisco", "Tokyo"];
  items = [];

  return (
    <>
      <h1>List</h1>
      {items.length === 0 ? <p>No item found</p> : null}
      {items.length === 0 && <p>No item found</p>}
      <div className="card-body">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </div>
    </>
  );
}

export default ListGroup;
