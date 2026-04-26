export async function GET(req, { params }) {
  try {
    const { username } = await params

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      })
    ])

    const userData = await userRes.json()
    const reposData = await reposRes.json()

    if (userData.message === 'Not Found') {
      return Response.json({ error: 'GitHub user not found' }, { status: 404 })
    }

    const totalStars = Array.isArray(reposData)
      ? reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0)
      : 0

    const languages = Array.isArray(reposData)
      ? [...new Set(reposData.map(r => r.language).filter(Boolean))].slice(0, 6)
      : []

    return Response.json({
      username: userData.login,
      name: userData.name,
      avatar: userData.avatar_url,
      bio: userData.bio,
      followers: userData.followers,
      following: userData.following,
      publicRepos: userData.public_repos,
      totalStars,
      languages,
      profileUrl: userData.html_url,
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}