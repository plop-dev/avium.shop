import { getUser } from '@/utils/getUser';
import Navbar, { NavMenuItem } from '../Navbar';

export default async function NavUser({ items }: { items: NavMenuItem[] }) {
	const user = await getUser();
	return <Navbar items={items} user={user || undefined} />;
}
