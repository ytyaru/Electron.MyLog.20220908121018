window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    console.log(Toastify);
    Toaster.toast('テストですわ')
    await window.myApi.loadDb(`src/db/mylog.db`)
    const db = new MyLogDb()
    Loading.setup()
    let setting = await Setting.load()
    console.log(setting)
    const maker = new SiteMaker(setting)
    if (setting?.mona?.address) { document.getElementById('address').value = setting.mona.address }
    if (setting?.github?.username) { document.getElementById('github-username').value =  setting?.github?.username }
    if (setting?.github?.email) { document.getElementById('github-email').value =  setting?.github?.email }
    if (setting?.github?.token) { document.getElementById('github-token').value = setting?.github?.token }
    if (setting?.github?.repo?.name) { document.getElementById('github-repo-name').value = setting?.github?.repo?.name }
    document.querySelector('#versions-table').innerHTML = await VersionsToHtml.toHtml()
    // https://www.electronjs.org/ja/docs/latest/api/window-open
    document.querySelector('#open-repo').addEventListener('click', async()=>{
        window.open(`https://github.com/${document.getElementById('github-username').value}/${document.getElementById('github-repo-name').value}`, `_blank`)
    })
    document.querySelector('#open-site').addEventListener('click', async()=>{
        window.open(setting.github.repo.homepage, `_blank`)
    })
    const git = new Git(setting)
    const hub = new GitHub(setting)
    document.querySelector('#post').addEventListener('click', async()=>{
        const insHtml = await db.insert(document.getElementById('content').value)
        if (!insHtml) { return }
        document.getElementById('post-list').innerHTML = insHtml + document.getElementById('post-list').innerHTML
        document.querySelector('#content').value = ''
        try {
            const exists = await git.init(setting, document.getElementById('github-repo-name').value)
            if (!exists) { // .gitがないなら
                console.log(`リクエスト開始`)
                console.log(setting.github.username)
                console.log(setting.github.token)
                console.log(setting.github.repo)
                const res = await hub.createRepo({
                    'name': document.getElementById('github-repo-name').value,
                    'description': setting.github.repo.description,
                    'homepage': setting.github.repo.homepage,
                })
                console.log(res)
                await maker.make()
                await git.push('新規作成', setting)
                await git.push('なぜか初回pushではasset/ディレクトリなどがアップロードされないので２回やってみる', setting) 
            }
            else { await git.push(`つぶやく:${new Date().toISOString()}`) }
        } catch (e) { Toaster.toast(e.message, true); console.error(e); }
        //} catch (e) { Toaster.toast(e.message, true); console.error(e); console.log(e.message); }
        //} catch (e) { Toaster.toast(e.message.replace('\n', '<br>') + '<br>aaa', true); console.error(e); console.log(e.message.replace('\n', '<br>')); }
        //} catch (e) { Toaster.toast(e.replace('\n', '<br>'), true); console.error(e); console.log(e); }
        //} catch (e) { Toaster.toast(e, true); console.error(e); }
    })
    document.querySelector('#delete').addEventListener('click', async()=>{
        const ids = Array.from(document.querySelectorAll(`#post-list input[type=checkbox][name=delete]:checked`)).map(d=>parseInt(d.value))
        console.debug(ids)
        await db.delete(ids)
        document.getElementById('post-list').innerHTML = await db.toHtml()
        try { await git.push(`つぶやき削除:${new Date().toISOString()}`, setting) }
        catch (e) { Toaster.toast(e.message, true); console.error(e); }
    })
    document.querySelector('#save-setting').addEventListener('click', async()=>{
        setting = await Setting.load()
        setting.mona.address = document.getElementById('address').value
        setting.github.username = document.getElementById('github-username').value
        setting.github.email = document.getElementById('github-email').value
        setting.github.token = document.getElementById('github-token').value
        setting.github.repo.name = document.getElementById('github-repo-name').value
        //setting.github.repo.description = document.getElementById('github-repo-description').value
        //setting.github.repo.homepage = document.getElementById('github-repo-homepage').value
        //setting.github.repo.topics = document.getElementById('github-repo-topics').value
        await Setting.save(setting)
        Toaster.toast(`設定ファイルを保存した`); 
        console.log(setting)
    })
    document.getElementById('post-list').innerHTML = await db.toHtml(document.getElementById('address').value)
    document.getElementById('content').focus()
    document.getElementById('content-length').textContent = db.LENGTH;
})
