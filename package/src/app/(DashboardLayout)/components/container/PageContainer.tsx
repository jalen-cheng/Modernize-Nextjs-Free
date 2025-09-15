import React from 'react';

type Props = {
  description?: string;
  children: React.ReactNode;
  title?: string;
};

const PageContainer = ({ title, description, children }: Props) => (
  <div>
    {children}
  </div>
);

export default PageContainer;
