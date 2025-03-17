export type Field = {
  name: string;
  type:
    | string
    | {
        type: string;
        options: {
          value: string | boolean;
          label: string;
        }[];
      };
  label: string;
  child?: React.ReactNode;
  className?: string;
};
