import * as React from "react"

import { cn } from "@/utils/index"

function Card({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card"
			className={cn(
				"bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border-2 py-6 shadow-sm",
				className
			)}
			{...props}
		/>
	)
}


function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
				className
			)}
			{...props}
		/>
	)
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-title"
			className={cn("leading-none font-semibold", className)}
			{...props}
		/>
	)
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	)
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end",
				className
			)}
			{...props}
		/>
	)
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-content"
			className={cn("px-6", className)}
			{...props}
		/>
	)
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn("flex text-center items-center px-6 [.border-t]:pt-6", className)}
			{...props}
		/>
	)
}


// NOTE added by abennar

type TitleProps = {
	children?: React.ReactNode;
	onClick?: () => void; // Fixed typo: React.ReactNodel -> () => void
};

const HeadButton = ({ children, onClick }: TitleProps) => (
	<div
		onClick={onClick}
		className="px-4 py-2 rounded-md font-bold text-sm text-slate-300 hover:text-white hover:bg-white/10 
			transition-colors duration-200 cursor-pointer"
	>
		{children}
	</div>
);


const Button = ({
	children,
	className = "",
	disabled = false,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
	<button
		type="button"
		disabled={disabled}
		className={`text-white bg-blue-400 hover:bg-blue-500 
			focus:ring-4 focus:ring-blue-300 font-medium 
			rounded-lg text-sm px-5 py-2.5 focus:outline-none 
			disabled:opacity-50 disabled:cursor-not-allowed 
			${className}`}
		{...props}
	>
		{children}
	</button>
);


// const Button = ({
// 	children,
// 	className = "",
// 	disabled = false,
// 	...props
// }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
// 	<button
// 		disabled={disabled}
// 		className={`text-white focus:ring-4 focus:ring-blue-300 
// 			font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none ${className}`}
// 		{...props}
// 	>
// 		{children}
// 	</button>
// );

// const GameModeCard = ({
// 	title,
// 	description,
// 	onClick,
// 	buttonClassName = "",
// 	buttonDisplayText = "",
// 	footer,
// 	children
// }: {
// 	title: React.ReactNode;
// 	description: string;
// 	onClick?: () => void;
// 	buttonClassName?: string;
// 	buttonDisplayText?: string;
// 	children?: React.ReactNode
// 	footer?: React.ReactNode
// }) => (
// 	<Card>
// 		<CardHeader>
// 			<CardTitle>{title}</CardTitle>
// 		</CardHeader>
// 		<CardContent className="text-center w-full max-w-2xl break-words">
// 			<p>{description}</p>
// 			{children && (
// 				<div className="mt-4">
// 					{children}
// 				</div>
// 			)}
// 		</CardContent>
// 		<CardFooter>
// 			{footer}
// 		</CardFooter>
// 	</Card >
// );

const GameModeCard = ({
	title,
	description,
	footer,
	children
}: {
	title: React.ReactNode;
	description: string;
	footer?: React.ReactNode;
	children?: React.ReactNode;
}) => (
	<Card>
		<CardHeader>
			<CardTitle>{title}</CardTitle>
		</CardHeader>
		<CardContent className="text-center w-full max-w-2xl break-words">
			<p>{description}</p>
			{children && <div className="mt-4">{children}</div>}
		</CardContent>
		{footer && <CardFooter>{footer}</CardFooter>}
	</Card>
);



export {
	Button,
	GameModeCard,
	HeadButton,
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
}
