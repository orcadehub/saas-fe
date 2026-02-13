import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

import ThemeCustomization from 'themes';
import tenantConfig from 'config/tenantConfig';

// auth provider

// ==============================|| APP ||============================== //

export default function App() {
  useEffect(() => {
    tenantConfig.load().then(config => {
      if (config?.tenantName) {
        document.title = config.tenantName;
      }
      if (config?.faviconUrl) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = config.faviconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    }).catch(console.error);
  }, []);

  return (
    <ThemeCustomization>
      <NavigationScroll>
        <>
          <RouterProvider router={router} />
        </>
      </NavigationScroll>
    </ThemeCustomization>
  );
}
