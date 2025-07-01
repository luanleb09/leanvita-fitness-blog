const SHEET_ID = '1m9Fy1dbFL2q3RimNacf8VnqA5CYFGnRv2lul60yHxbQ' // thay bằng của bạn
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`

async function fetchPosts() {
  const res = await fetch(SHEET_URL)
  const text = await res.text()
  const json = JSON.parse(text.substring(47).slice(0, -2)) // bỏ phần wrapper Google
  const rows = json.table.rows

  return rows.map(row => {
    return {
      id: row.c[0]?.v || '',
      title: row.c[1]?.v || '',
      summary: row.c[2]?.v || '',
      image: row.c[3]?.v || '',
      contentUrl: row.c[4]?.v || '',
      tag: row.c[5]?.v || '',
    }
  })
}