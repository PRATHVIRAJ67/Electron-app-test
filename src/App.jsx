import React, { useState, useEffect } from 'react';

const installerUrl = 'https://nevitondatastorage.s3.amazonaws.com/ElectronApp%20Setup%201.0.0.exe';
const healthUrl = 'http://127.0.0.1:17654/health';

function App() {
  const [appInstalled, setAppInstalled] = useState(null); // null = checking, true = installed, false = not

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

    fetch(healthUrl, { signal: controller.signal, cache: 'no-store' })
      .then(res => {
        if (res.ok) setAppInstalled(true);
        else setAppInstalled(false);
      })
      .catch(() => setAppInstalled(false))
      .finally(() => clearTimeout(timeout));

    return () => clearTimeout(timeout);
  }, []);

  const handleOpenApp = () => {
    window.location.assign('myprintapp://open');
  };

  if (appInstalled === null) return <div>Checking app status...</div>;

  return (
    <div>
      {appInstalled ? (
        <button onClick={handleOpenApp}>Open App</button>
      ) : (
        <a href={installerUrl}>
          <button>Install App</button>
        </a>
      )}
    </div>
  );
}

export default App;
 