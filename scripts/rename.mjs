import fs from 'fs'
import path from 'path'

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const dirFile = path.join(dir, file)
    const dirent = fs.statSync(dirFile)
    if (dirent.isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.next') && !dirFile.includes('.git')) {
        filelist = walkSync(dirFile, filelist)
      }
    } else {
      if (
        dirFile.endsWith('.js') ||
        dirFile.endsWith('.json') ||
        dirFile.endsWith('.md') ||
        dirFile.endsWith('.css') ||
        dirFile.endsWith('.sql') ||
        dirFile.endsWith('.txt')
      ) {
        filelist.push(dirFile)
      }
    }
  }
  return filelist
}

const rootDir = process.cwd()
console.log('Root dir:', rootDir)
const files = walkSync(rootDir)

let modifiedCount = 0

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  let changed = false

  // KidTech -> AIgenlabs
  if (content.includes('KidTech')) {
    content = content.replace(/KidTech/g, 'AIgenlabs')
    changed = true
  }

  // Kidtech -> AIgenlabs
  if (content.includes('Kidtech')) {
    content = content.replace(/Kidtech/g, 'AIgenlabs')
    changed = true
  }

  // kidtech -> aigenlabs
  if (content.includes('kidtech')) {
    content = content.replace(/kidtech/g, 'aigenlabs')
    changed = true
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8')
    console.log('Updated:', file)
    modifiedCount++
  }
}

console.log(`Finished renaming. Modified ${modifiedCount} files.`)
