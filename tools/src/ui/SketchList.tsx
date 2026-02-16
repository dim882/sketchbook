import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { navigateToSketch } from './NavUtils';
import styles from './SketchList.module.css';
import type { IDir, IDirTreeNode } from '../lib/types';

export type { IDir };

export interface SketchListProps {
  dirs: IDir[];
}

type SortMethod = 'recent' | 'alpha';

function sortTreeNodes(nodes: IDirTreeNode[], sortMethod: SortMethod): IDirTreeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.isSketch !== b.isSketch) return a.isSketch ? 1 : -1;
    if (sortMethod === 'recent' && a.isSketch && b.isSketch) {
      return b.lastModified - a.lastModified;
    }
    return a.name.localeCompare(b.name);
  });
}

function buildTree(dirs: IDir[]): IDirTreeNode[] {
  const root: IDirTreeNode[] = [];

  for (const dir of dirs) {
    const segments = dir.path.split('/');
    let currentLevel = root;

    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      let folder = currentLevel.find((n) => n.name === segment && !n.isSketch);
      if (!folder) {
        folder = {
          name: segment,
          path: segments.slice(0, i + 1).join('/'),
          lastModified: 0,
          isSketch: false,
          children: [],
        };
        currentLevel.push(folder);
      }
      currentLevel = folder.children!;
    }

    currentLevel.push({ ...dir });
  }

  return root;
}

const TreeNode: FunctionComponent<{
  node: IDirTreeNode;
  depth: number;
  sortMethod: SortMethod;
  onSketchClick: (path: string) => (e: Event) => void;
}> = ({ node, depth, sortMethod, onSketchClick }) => {
  const [expanded, setExpanded] = useState(true);

  if (!node.isSketch && node.children) {
    const sorted = sortTreeNodes(node.children, sortMethod);
    return (
      <li>
        <button
          class={styles.folderToggle}
          style={{ paddingLeft: `${depth * 16}px` }}
          onClick={() => setExpanded(!expanded)}
        >
          <span class={styles.folderIcon}>{expanded ? '▼' : '▶'}</span>
          {node.name}
        </button>
        {expanded && (
          <ul>
            {sorted.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                sortMethod={sortMethod}
                onSketchClick={onSketchClick}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li class={styles.listItem} style={{ paddingLeft: `${depth * 16}px` }}>
      <a href={`/nav/${node.path}`} onClick={onSketchClick(node.path)} class={styles.link}>
        {node.name}
      </a>
      &nbsp;
      <a href={`/sketches/${node.path}`} target="_blank" rel="noopener noreferrer" class={styles.externalLink}>
        ↗
      </a>
    </li>
  );
};

const SketchList: FunctionComponent<SketchListProps> = ({ dirs }) => {
  const [sortMethod, setSortMethod] = useState<SortMethod>('alpha');
  const handleSort = (method: SortMethod) => () => setSortMethod(method);

  const handleSketchClick = (sketchPath: string) => (e: Event) => {
    e.preventDefault();
    navigateToSketch(sketchPath);
  };

  const tree = buildTree(dirs);
  const sorted = sortTreeNodes(tree, sortMethod);

  return (
    <div class={styles.list}>
      <h1 class={styles.title}>Sketches</h1>

      <div class={styles.sortButtons}>
        <button
          class={`${styles.sortButton} ${sortMethod === 'alpha' ? styles.active : ''}`}
          onClick={handleSort('alpha')}
        >
          Alphabetical
        </button>
        <button
          class={`${styles.sortButton} ${sortMethod === 'recent' ? styles.active : ''}`}
          onClick={handleSort('recent')}
        >
          Recent
        </button>
      </div>

      <ul>
        {sorted.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            sortMethod={sortMethod}
            onSketchClick={handleSketchClick}
          />
        ))}
      </ul>
    </div>
  );
};
export default SketchList;
