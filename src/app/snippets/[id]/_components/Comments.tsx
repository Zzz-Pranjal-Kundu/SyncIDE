import { Id } from '../../../../../convex/_generated/dataModel'

function Comments({snippetId}: {snippetId: Id<"snippets">}) {
  return (
    <div data-snippet-id={snippetId}>Comments</div>
  );
}

export default Comments