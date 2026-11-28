// English keys; columns are Spanish, French, German, Brazilian Portuguese, Japanese.
const locales = ['es-ES', 'fr-FR', 'de-DE', 'pt-BR', 'ja-JP'];
const rows = `
Language|Idioma|Langue|Sprache|Idioma|言語
Menu|Menú|Menu|Menü|Menu|メニュー
Open mobile menu|Abrir menú móvil|Ouvrir le menu mobile|Mobiles Menü öffnen|Abrir menu móvel|モバイルメニューを開く
Nav|Navegación|Navigation|Navigation|Navegação|ナビ
Light|Claro|Clair|Hell|Claro|ライト
Dark|Oscuro|Sombre|Dunkel|Escuro|ダーク
Simple|Simple|Simple|Einfach|Simples|シンプル
Adv|Avanzado|Avancé|Erweitert|Avançado|詳細
Command Deck|Centro de mando|Centre de commande|Kommandozentrale|Central de comando|司令デッキ
Your mission control center|Tu centro de control de misiones|Votre centre de contrôle des missions|Deine Missionszentrale|Sua central de controle de missões|ミッション管制センター
Observation Deck|Centro de observación|Poste d’observation|Beobachtungsdeck|Central de observação|観測デッキ
Watchlist|Lista de seguimiento|Liste de suivi|Beobachtungsliste|Lista de acompanhamento|ウォッチリスト
Saved Items|Elementos guardados|Éléments enregistrés|Gespeicherte Elemente|Itens salvos|保存済みアイテム
Beta Feedback|Comentarios sobre la beta|Retours sur la bêta|Beta-Feedback|Feedback da versão beta|ベータ版へのフィードバック
Forum|Foro|Forum|Forum|Fórum|フォーラム
Initiations|Iniciaciones|Initiations|Einweihungen|Iniciações|イニシエーション
Quests|Desafíos|Quêtes|Quests|Jornadas|クエスト
Synchronicity|Sincronicidad|Synchronicité|Synchronizität|Sincronicidade|シンクロニシティ
Gamification|Gamificación|Ludification|Gamifizierung|Gamificação|ゲーミフィケーション
Mentorship|Mentoría|Mentorat|Mentoring|Mentoria|メンタリング
Matches|Coincidencias|Correspondances|Matches|Conexões sugeridas|マッチ
Meetings|Reuniones|Réunions|Besprechungen|Reuniões|ミーティング
Conference Portal|Portal de conferencias|Portail des conférences|Konferenzportal|Portal de conferências|会議ポータル
Missions|Misiones|Missions|Missionen|Missões|ミッション
Teams & Guilds|Equipos y gremios|Équipes et guildes|Teams und Gilden|Equipes e guildas|チームとギルド
Projects|Proyectos|Projets|Projekte|Projetos|プロジェクト
Project Track|Seguimiento de proyectos|Suivi des projets|Projektverfolgung|Acompanhamento de projetos|プロジェクト進捗
Profiles|Perfiles|Profils|Profile|Perfis|プロフィール一覧
Contact Network|Red de contactos|Réseau de contacts|Kontaktnetzwerk|Rede de contatos|連絡先ネットワーク
Deals|Acuerdos|Transactions|Geschäfte|Negociações|取引
Activity Feed|Feed de actividad|Fil d’activité|Aktivitätsfeed|Feed de atividades|アクティビティフィード
Community|Comunidad|Communauté|Community|Comunidade|コミュニティ
Collaborators|Colaboradores|Collaborateurs|Mitwirkende|Colaboradores|協力者
Marketplace|Mercado|Place de marché|Marktplatz|Mercado|マーケットプレイス
Messages|Mensajes|Messages|Nachrichten|Mensagens|メッセージ
Events|Eventos|Événements|Veranstaltungen|Eventos|イベント
Leader Channel|Canal de líderes|Canal des leaders|Führungskanal|Canal de líderes|リーダーチャンネル
Circles|Círculos|Cercles|Kreise|Círculos|サークル
Studio|Estudio|Studio|Studio|Estúdio|スタジオ
Content Studio|Estudio de contenido|Studio de contenu|Content-Studio|Estúdio de conteúdo|コンテンツスタジオ
Affiliate|Afiliados|Affiliation|Partnerprogramm|Afiliados|アフィリエイト
News|Noticias|Actualités|Neuigkeiten|Notícias|ニュース
Videos|Vídeos|Vidéos|Videos|Vídeos|動画
Broadcast|Transmisión|Diffusion|Übertragung|Transmissão|配信
Leaderboards|Clasificaciones|Classements|Ranglisten|Classificações|ランキング
Leaderboard|Clasificación|Classement|Rangliste|Classificação|ランキング
Learning Hub|Centro de aprendizaje|Espace d’apprentissage|Lernzentrum|Central de aprendizado|学習ハブ
Resources|Recursos|Ressources|Ressourcen|Recursos|リソース
Document Vault|Archivo de documentos|Coffre de documents|Dokumententresor|Cofre de documentos|ドキュメント保管庫
Advice|Consejos|Conseils|Rat|Conselhos|アドバイス
Dating|Citas|Rencontres|Dating|Relacionamentos|出会い
Schedule|Calendario|Agenda|Zeitplan|Agenda|スケジュール
Daily Ops|Operaciones diarias|Opérations quotidiennes|Tagesplanung|Operações diárias|日次業務
Notes|Notas|Notes|Notizen|Notas|メモ
Digital Rights|Derechos digitales|Droits numériques|Digitale Rechte|Direitos digitais|デジタル権利
Treasury|Tesorería|Trésorerie|Schatzkammer|Tesouraria|トレジャリー
Lottery|Lotería|Loterie|Lotterie|Loteria|宝くじ
Profile|Perfil|Profil|Profil|Perfil|プロフィール
Settings|Configuración|Paramètres|Einstellungen|Configurações|設定
Help & FAQ|Ayuda y preguntas frecuentes|Aide et FAQ|Hilfe und FAQ|Ajuda e perguntas frequentes|ヘルプとよくある質問
Support|Soporte|Assistance|Support|Suporte|サポート
Global Chat|Chat global|Discussion mondiale|Globaler Chat|Chat global|グローバルチャット
Quick Create|Creación rápida|Création rapide|Schnell erstellen|Criação rápida|クイック作成
Replay Platform Tour|Repetir el recorrido|Revoir la visite guidée|Plattformtour wiederholen|Rever o tour da plataforma|プラットフォームツアーをもう一度見る
Quick Start Guide|Guía de inicio rápido|Guide de démarrage rapide|Schnellstartanleitung|Guia de início rápido|クイックスタートガイド
Read Me - Quick Start Guide|Lee esto: guía de inicio rápido|À lire : guide de démarrage rapide|Bitte lesen: Schnellstartanleitung|Leia: guia de início rápido|はじめに：クイックスタートガイド
READ ME|LEE ESTO|À LIRE|BITTE LESEN|LEIA ISTO|はじめに
Getting Started Tours|Recorridos de introducción|Visites de découverte|Einführungstouren|Tours introdutórios|入門ツアー
ACTIVITY CARDS|TARJETAS DE ACTIVIDAD|CARTES D’ACTIVITÉ|AKTIVITÄTSKARTEN|CARTÕES DE ATIVIDADE|アクティビティカード
Earn|Ganar|Gagner|Verdienen|Ganhar|稼ぐ
Learn|Aprender|Apprendre|Lernen|Aprender|学ぶ
Build|Crear|Créer|Aufbauen|Criar|作る
Teach|Enseñar|Enseigner|Lehren|Ensinar|教える
Lead|Liderar|Diriger|Führen|Liderar|リードする
Connect|Conectar|Se connecter|Vernetzen|Conectar|つながる
Network|Red|Réseau|Netzwerk|Rede|ネットワーク
Guide|Guía|Guide|Leitfaden|Guia|ガイド
Active|Activo|Actif|Aktiv|Ativo|有効
Apply|Postularse|Candidater|Bewerben|Candidatar-se|応募する
News & Updates|Noticias y novedades|Actualités et nouveautés|Neuigkeiten und Updates|Notícias e novidades|ニュースと最新情報
Hero Gallery|Galería de banners|Galerie de bannières|Banner-Galerie|Galeria de banners|バナーギャラリー
Quick Actions|Acciones rápidas|Actions rapides|Schnellaktionen|Ações rápidas|クイック操作
Quick Start Checklist|Lista de inicio rápido|Liste de démarrage rapide|Schnellstart-Checkliste|Lista de início rápido|クイックスタートチェックリスト
Challenges & Rewards|Desafíos y recompensas|Défis et récompenses|Herausforderungen und Belohnungen|Desafios e recompensas|チャレンジと報酬
Inbox & Signals|Bandeja y señales|Boîte de réception et signaux|Posteingang und Signale|Caixa de entrada e sinais|受信箱とシグナル
Potential Collaborators|Posibles colaboradores|Collaborateurs potentiels|Potenzielle Mitwirkende|Possíveis colaboradores|協力者候補
Community Feed|Feed de la comunidad|Fil de la communauté|Community-Feed|Feed da comunidade|コミュニティフィード
Circles & Regions|Círculos y regiones|Cercles et régions|Kreise und Regionen|Círculos e regiões|サークルと地域
Community Voices|Voces de la comunidad|Voix de la communauté|Stimmen der Community|Vozes da comunidade|コミュニティの声
Online Users|Usuarios conectados|Utilisateurs en ligne|Online-Mitglieder|Usuários on-line|オンラインユーザー
Tune Engine|Ajustar el motor|Ajuster le moteur|Engine einstellen|Ajustar o motor|エンジンを調整
Search people, offers, missions...|Buscar personas, ofertas, misiones…|Rechercher des personnes, offres, missions…|Personen, Angebote, Missionen suchen…|Buscar pessoas, ofertas, missões…|ユーザー、オファー、ミッションを検索…
Enter deep search...|Iniciar búsqueda avanzada…|Lancer une recherche approfondie…|Tiefensuche starten…|Iniciar busca avançada…|詳細検索を開始…
Search projects...|Buscar proyectos…|Rechercher des projets…|Projekte suchen…|Buscar projetos…|プロジェクトを検索…
Status|Estado|Statut|Status|Status|ステータス
Refresh profile data|Actualizar datos del perfil|Actualiser les données du profil|Profildaten aktualisieren|Atualizar dados do perfil|プロフィール情報を更新
Global Schedule|Calendario global|Agenda mondial|Globaler Zeitplan|Agenda global|グローバルスケジュール
Leader Pathway|Ruta de liderazgo|Parcours de leadership|Führungspfad|Trilha de liderança|リーダーへの道
Meetings & Momentum|Reuniones e impulso|Réunions et dynamique|Besprechungen und Fortschritt|Reuniões e progresso|ミーティングと進捗
Marketplace: Earn & Learn|Mercado: gana y aprende|Place de marché : gagner et apprendre|Marktplatz: Verdienen und Lernen|Mercado: ganhe e aprenda|マーケットプレイス：稼ぐ・学ぶ
Influence & Reach|Influencia y alcance|Influence et portée|Einfluss und Reichweite|Influência e alcance|影響力とリーチ
144K Leader Channel|Canal de líderes 144K|Canal des leaders 144K|144K-Führungskanal|Canal de líderes 144K|144Kリーダーチャンネル
St. Germain Affirmations|Afirmaciones de St. Germain|Affirmations de St. Germain|St.-Germain-Affirmationen|Afirmações de St. Germain|サンジェルマンのアファメーション
SaintTube Videos|Vídeos de SaintTube|Vidéos SaintTube|SaintTube-Videos|Vídeos do SaintTube|SaintTubeの動画
New|Nuevo|Nouveau|Neu|Novo|新着
Live|En directo|En direct|Live|Ao vivo|ライブ
Sign out|Cerrar sesión|Se déconnecter|Abmelden|Sair|ログアウト
Dashboard|Panel de control|Tableau de bord|Übersicht|Painel|ダッシュボード
Rank|Rango|Rang|Rang|Nível|ランク
Reach|Alcance|Portée|Reichweite|Alcance|リーチ
Earned|Ganancias|Gains|Verdienst|Ganhos|獲得額
Theme|Tema|Thème|Design|Tema|テーマ
Loading...|Cargando…|Chargement…|Wird geladen…|Carregando…|読み込み中…
My Guide|Mi guía|Mon guide|Mein Leitfaden|Meu guia|マイガイド
Global Impact Dashboard|Panel de impacto global|Tableau de bord de l’impact mondial|Übersicht zur globalen Wirkung|Painel de impacto global|グローバルインパクトダッシュボード
Quick access|Acceso rápido|Accès rapide|Schnellzugriff|Acesso rápido|クイックアクセス
Manage quick access|Gestionar el acceso rápido|Gérer l’accès rapide|Schnellzugriff verwalten|Gerenciar o acesso rápido|クイックアクセスを管理
Member Profile|Perfil de miembro|Profil de membre|Mitgliederprofil|Perfil de membro|メンバープロフィール
7-day welcome course|Curso de bienvenida de 7 días|Cours de bienvenue sur 7 jours|7-tägiger Einführungskurs|Curso de boas-vindas de 7 dias|7日間のウェルカムコース
Command Deck Overview · Full screen|Vista general del centro de mando · Pantalla completa|Vue d’ensemble du centre de commande · Plein écran|Überblick über die Kommandozentrale · Vollbild|Visão geral da central de comando · Tela cheia|司令デッキの概要 · 全画面
Start with the full-screen overview or choose any topic tour. Read or listen at your own pace.|Empieza con la vista general a pantalla completa o elige un recorrido temático. Lee o escucha a tu ritmo.|Commencez par l’aperçu en plein écran ou choisissez une visite thématique. Lisez ou écoutez à votre rythme.|Beginne mit der Vollbildübersicht oder wähle eine Thementour. Lies oder höre in deinem eigenen Tempo.|Comece pela visão geral em tela cheia ou escolha um tour temático. Leia ou ouça no seu ritmo.|全画面の概要から始めるか、テーマ別ツアーを選んでください。自分のペースで読んだり聞いたりできます。
Hacker|Hacker|Hacker|Hacker|Hacker|ハッカー
Followers|Seguidores|Abonnés|Follower|Seguidores|フォロワー
Following|Siguiendo|Abonnements|Gefolgt|Seguindo|フォロー中
AI Discover|Descubrir con IA|Découvrir avec l’IA|Mit KI entdecken|Descobrir com IA|AIで発見
Synchronicity Engine|Motor de sincronicidad|Moteur de synchronicité|Synchronizitäts-Engine|Motor de sincronicidade|シンクロニシティエンジン
Deep Disclosure Podcast|Pódcast Deep Disclosure|Podcast Deep Disclosure|Deep Disclosure-Podcast|Podcast Deep Disclosure|Deep Disclosure ポッドキャスト
Saint Intelligence|Inteligencia Saint|Intelligence Saint|Saint-Intelligenz|Inteligência Saint|セイント・インテリジェンス
Top GGG Mission|Misión GGG destacada|Mission GGG à la une|Top-GGG-Mission|Missão GGG em destaque|注目のGGGミッション
Learn about {title}|Más sobre {title}|En savoir plus : {title}|Mehr zu {title}|Saiba mais sobre {title}|{title}について詳しく
The Basics|Lo básico|Les bases|Die Grundlagen|O básico|基本
Discover SaintAgent|Descubre SaintAgent|Découvrir SaintAgent|SaintAgent entdecken|Descubra o SaintAgent|SaintAgentを知る
Meet and Connect|Conoce y conecta|Rencontrer et échanger|Kennenlernen und vernetzen|Conheça e conecte-se|出会いとつながり
Missions, Quests & Rewards|Misiones, desafíos y recompensas|Missions, quêtes et récompenses|Missionen, Quests und Belohnungen|Missões, jornadas e recompensas|ミッション、クエスト、報酬
Build and Manage Work|Crea y gestiona tu trabajo|Créer et gérer son travail|Arbeit planen und verwalten|Crie e gerencie seu trabalho|作業の作成と管理
Create, Offer & Share|Crea, ofrece y comparte|Créer, proposer et partager|Erstellen, anbieten und teilen|Crie, ofereça e compartilhe|作成、提供、共有
Use the Advanced Tools|Usa las herramientas avanzadas|Utiliser les outils avancés|Erweiterte Werkzeuge nutzen|Use as ferramentas avançadas|高度なツールを使う
What’s New Walkthrough|Recorrido por las novedades|Visite des nouveautés|Tour durch die Neuerungen|Tour pelas novidades|新機能の案内
Play {title}|Reproducir: {title}|Lancer : {title}|Abspielen: {title}|Reproduzir: {title}|{title}を再生
Replay {title}|Repetir: {title}|Rejouer : {title}|Wiederholen: {title}|Repetir: {title}|{title}をもう一度見る
Resume {title}|Continuar: {title}|Reprendre : {title}|Fortsetzen: {title}|Continuar: {title}|{title}を再開
Start {title}|Iniciar: {title}|Démarrer : {title}|Starten: {title}|Iniciar: {title}|{title}を開始
Tour {number}: {title}|Recorrido {number}: {title}|Visite {number} : {title}|Tour {number}: {title}|Tour {number}: {title}|ツアー{number}：{title}
Completed; select to replay|Completado; selecciona para repetir|Terminé ; sélectionner pour rejouer|Abgeschlossen; zum Wiederholen auswählen|Concluído; selecione para repetir|完了。選択してもう一度見る
Series complete|Serie completada|Série terminée|Reihe abgeschlossen|Série concluída|シリーズ完了
{completed} of {total} tours finished|{completed} de {total} recorridos completados|{completed} visites terminées sur {total}|{completed} von {total} Touren abgeschlossen|{completed} de {total} tours concluídos|全{total}件中{completed}件のツアーが完了
`;

export default new Map(rows.trim().split('\n').map(row => {
  const [key, ...values] = row.split('|');
  return [key, Object.fromEntries(locales.map((locale, index) => [locale, values[index]]))];
}));