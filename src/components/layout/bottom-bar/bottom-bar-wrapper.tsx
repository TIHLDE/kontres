// import { getItems } from '@/utils/apis/items';
// import { PermissionApp } from '@/utils/apis/types'; // TODO: Fix this import
// import { checkUserPermissions, getCurrentUserData } from '@/utils/apis/user'; // TODO: Fix this import
import BottomBar from './bottom-bar';

const BottomBarWrapper = async () => {
    let user;
    let admin;
    let items;
    try {
        // user = await getCurrentUserData();
        // admin = await checkUserPermissions([PermissionApp.USER]);
        // items = await getItems();
    } catch (e) {}

    return <></>;
    // return <BottomBar user={user} admin={admin} items={items} />;
};

export default BottomBarWrapper;
