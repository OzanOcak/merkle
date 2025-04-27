// components/explorer/utils/tree.ts

import { FolderType } from '../utils/types'

export const initialFolders: FolderType[] = [
  {
    name: 'Articles',
    folders: [
      { name: 'Documents', folders: [] },
      { name: 'Blogs', folders: [] }
    ]
  },
  {
    name: 'Movies',
    folders: [{ name: 'Birdman.md' }, { name: 'The Wild Robot.md' }]
  },
  {
    name: 'Music',
    folders: [
      {
        name: 'Jazz',
        folders: [{ name: '1960', folders: [{ name: 'dark_blues.md' }] }]
      },
      { name: 'Blues', folders: [] }
    ]
  },
  { name: 'Images', folders: [] },
  { name: 'mynote.md' }
]

export function addFileToTree(
  tree: FolderType[],
  parentPath: string[],
  fileName: string
): FolderType[] {
  if (parentPath.length === 0) {
    return [...tree, { name: fileName }]
  }

  return tree.map((folder) => {
    if (folder.name === parentPath[0] && folder.folders) {
      return {
        ...folder,
        folders: addFileToTree(folder.folders, parentPath.slice(1), fileName)
      }
    }
    return folder
  })
}

export function addFolderToRoot(tree: FolderType[], folderName: string): FolderType[] {
  return [...tree, { name: folderName, folders: [] }]
}

export function addFolderToPath(
  tree: FolderType[],
  path: string[],
  folderName: string
): FolderType[] {
  if (path.length === 0) {
    return [...tree, { name: folderName, folders: [] }]
  }

  return tree.map((folder) => {
    if (folder.name === path[0] && folder.folders) {
      return {
        ...folder,
        folders: addFolderToPath(folder.folders, path.slice(1), folderName)
      }
    }
    return folder
  })
}

// components/explorer/utils/tree.ts
export function addFileToPath(tree: FolderType[], path: string[], fileName: string): FolderType[] {
  if (path.length === 0) {
    return [...tree, { name: fileName }] // Add to root if no path
  }

  return tree.map((folder) => {
    if (folder.name === path[0] && folder.folders) {
      const isLastSegment = path.length === 1
      return {
        ...folder,
        folders: isLastSegment
          ? [...folder.folders, { name: fileName }] // Add file to this folder
          : addFileToPath(folder.folders, path.slice(1), fileName) // Recurse deeper
      }
    }
    return folder
  })
}

// components/explorer/utils/tree.ts
export function deleteNodeAtPath(tree: FolderType[], path: string[]): FolderType[] {
  if (path.length === 0) return tree

  if (path.length === 1) {
    return tree.filter((item) => item.name !== path[0])
  }

  return tree.map((item) => {
    if (item.name === path[0] && item.folders) {
      return {
        ...item,
        folders: deleteNodeAtPath(item.folders, path.slice(1))
      }
    }
    return item
  })
}

// components/explorer/utils/tree.ts
export function deleteFolderAtPath(tree: FolderType[], path: string[]): FolderType[] {
  if (path.length === 0) return tree

  if (path.length === 1) {
    // Only delete if it's a folder (has folders property)
    return tree.filter((item) => item.name !== path[0] || !item.folders)
  }

  return tree.map((item) => {
    if (item.name === path[0] && item.folders) {
      return {
        ...item,
        folders: deleteFolderAtPath(item.folders, path.slice(1))
      }
    }
    return item
  })
}

// components/explorer/utils/tree.ts
export function findFolder(tree: FolderType[], path: string[]): FolderType | null {
  if (path.length === 0) return null

  let current = tree.find((item) => item.name === path[0])
  if (!current) return null

  for (let i = 1; i < path.length; i++) {
    if (!current.folders) return null
    current = current.folders.find((item) => item.name === path[i])
    if (!current) return null
  }
  return current
}

export function renameFolderAtPath(
  tree: FolderType[],
  path: string[],
  newName: string
): FolderType[] {
  if (path.length === 0) return tree

  return tree.map((item) => {
    if (item.name === path[0]) {
      if (path.length === 1) {
        // Rename this folder
        return { ...item, name: newName }
      } else if (item.folders) {
        // Recurse deeper
        return {
          ...item,
          folders: renameFolderAtPath(item.folders, path.slice(1), newName)
        }
      }
    }
    return item
  })
}

export function deleteFileAtPath(tree: FolderType[], path: string[]): FolderType[] {
  if (path.length === 0) return tree

  if (path.length === 1) {
    // Only delete if it's a file (doesn't have folders property)
    return tree.filter((item) => item.name !== path[0] || item.folders)
  }

  return tree.map((item) => {
    if (item.name === path[0] && item.folders) {
      return {
        ...item,
        folders: deleteFileAtPath(item.folders, path.slice(1))
      }
    }
    return item
  })
}

export function addItemToPath(
  folders: FolderType[],
  path: string[],
  item: FolderType
): FolderType[] {
  if (path.length === 0) return [...folders, item]

  const [current, ...rest] = path
  const index = folders.findIndex((f) => f.name === current)

  if (index === -1) return folders

  const updatedFolder = {
    ...folders[index],
    folders: addItemToPath(folders[index].folders || [], rest, item)
  }

  return [...folders.slice(0, index), updatedFolder, ...folders.slice(index + 1)]
}

export function deleteItemAtPath(folders: FolderType[], path: string[]): FolderType[] {
  if (path.length === 0) return folders

  const [current, ...rest] = path
  const index = folders.findIndex((f) => f.name === current)

  if (index === -1) return folders

  if (rest.length === 0) {
    // Remove the item at this level
    return [...folders.slice(0, index), ...folders.slice(index + 1)]
  }

  // Recurse deeper
  return [
    ...folders.slice(0, index),
    {
      ...folders[index],
      folders: folders[index].folders ? deleteItemAtPath(folders[index].folders, rest) : undefined
    },
    ...folders.slice(index + 1)
  ]
}
