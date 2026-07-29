interface SettingsHeaderProps {
  title: string;
  description: string;
}

const SettingsHeader = ({ title, description }: SettingsHeaderProps) => {
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>

      <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
};

export default SettingsHeader;
