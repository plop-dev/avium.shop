import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SignUpPage() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Create your account</CardTitle>
				<CardDescription>Join Avium for </CardDescription>
				{/* <CardAction>Card Action</CardAction> */}
			</CardHeader>
			<CardContent>
				<p>Card Content</p>
			</CardContent>
			<CardFooter>
				<p>Card Footer</p>
			</CardFooter>
		</Card>
	);
}
