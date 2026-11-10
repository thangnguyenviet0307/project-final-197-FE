import { Link } from 'react-router-dom';
import { policyDocuments } from '@/features/support/utils/policy-documents';

export function ProductPolicyText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, index) => {
        const policy = policyDocuments.find(
          (item) => item.path === line.trim()
        );
        return (
          <span key={index}>
            {index > 0 && '\n'}
            {policy ? (
              <Link
                to={policy.path}
                className="text-primary underline underline-offset-2"
              >
                {policy.title}
              </Link>
            ) : (
              line
            )}
          </span>
        );
      })}
    </>
  );
}
