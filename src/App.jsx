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
    // Automatically clear localStorage every day at 3:00 AM IST
    const checkAndClearStorage = () => {
      const now = new Date();
      // Calculate current time in IST (UTC + 5:30)
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
      
      const hours = istTime.getHours();
      
      // Determine the current "clearance schedule day"
      // If it's before 3 AM IST, it belongs to yesterday's schedule block
      let clearDayDate = new Date(istTime);
      if (hours < 3) {
        clearDayDate.setDate(clearDayDate.getDate() - 1);
      }
      
      const currentClearKey = clearDayDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const lastClearKey = localStorage.getItem('lastStorageClearDate');
      
      if (!lastClearKey) {
        // Initialize for brand new visitors without a jarring reload
        localStorage.setItem('lastStorageClearDate', currentClearKey);
      } else if (lastClearKey !== currentClearKey) {
        // Wipe exactly once per day, starting firmly at 3:00 AM IST or first load after
        localStorage.clear();
        localStorage.setItem('lastStorageClearDate', currentClearKey);
        window.location.reload(); 
      }
    };

    checkAndClearStorage();
    const intervalId = setInterval(checkAndClearStorage, 60000); // Check every 60 seconds

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

    return () => clearInterval(intervalId);
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
