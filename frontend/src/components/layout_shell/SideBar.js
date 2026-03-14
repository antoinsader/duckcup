import styles from  './Layout.module.scss';
import { useAuth } from '../../lib/contexts/AuthContext';

const Sidebar = ({ routes, route_click, open_tabs_ids, active_route_id }) => {
  const { authenticated: is_authenticated } = useAuth();

  const is_route_visible = (route) => {
    if (route.show_only_if_auth && !is_authenticated) return false;
    return !route.hide_sidebar;
  };

  const normal_routes = routes.filter(
    (route) => is_route_visible(route) && !route.is_footer_route
  );
  const footer_routes = routes.filter(
    (route) => is_route_visible(route) && route.is_footer_route
  );


  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebar_top_routes}>
        {normal_routes.map((route) => (
          <div
            key={route.id}
            className={`${styles.sidebarItem} ${open_tabs_ids.includes(route.id) ? styles.active : ''} ${route.id === active_route_id ? styles.opened : ''}`}
            onClick={() => route_click(route.id)}
          >
            <span className={styles.icon_container}> {route.icon} </span>
            <span className={styles.tooltip}>{route.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.sidebar_footer_routes}>
        {footer_routes.map((route) => (
          <div
            key={route.id}
            className={`${styles.sidebarItem} ${open_tabs_ids.includes(route.id) ? styles.active : ''}`}
            onClick={() => route_click(route.id)}
          >
            <span className={styles.icon_container}> {route.icon} </span>
            <span className={styles.tooltip}>{route.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
