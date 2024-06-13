import { h, render } from 'preact';

import { useEffect, useState } from 'preact/hooks';
// import { getAPI } from 'obsidian-dataview';

let DataviewAPI;

import('obsidian-dataview').then((module) => {
  console.log({ module });

  const getAPI = module.getAPI;
  const api = getAPI();
  // Use the api here
  DataviewAPI = getAPI();
  console.log({ DataviewAPI });
});

const DataviewComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const dv = new DataviewAPI();
    const query = `TABLE file.name FROM "your-folder"`;
    const result = dv.query(query);
    setData(result);
  }, []);

  return (
    <div>
      <h1>Dataview Query Result</h1>
      {data ? (
        <ul>
          {data.map((item) => (
            <li key={item.file.name}>{item.file.name}</li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DataviewComponent;
