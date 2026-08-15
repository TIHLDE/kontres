import { cn } from '@/lib/utils';

type BlurBackgroundProps = React.HTMLProps<HTMLDivElement>;
const BlurBackground = ({
    className,
    children,
    ...props
}: BlurBackgroundProps) => {
    return (
        <div className={cn('w-full')} {...props}>
            {children}
            <div className="h-96 w-24 rotate-45 bg-cyan-400/40 blur-3xl absolute -bottom-24 left-1 -z-10" />
            <div className="h-96 w-96 bg-cyan-400/30 blur-3xl absolute -top-[250px] right-36 -z-10" />
        </div>
    );
};

export default BlurBackground;
